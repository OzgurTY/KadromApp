import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  runTransaction,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

// Yeni Maç Oluştur
export const createMatch = async (matchData) => {
  try {
    const docRef = await addDoc(collection(db, "matches"), {
      ...matchData,
      createdBy: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'upcoming', 
      players: [],
      teamA: [],
      teamB: [],
      colorA: '#00D09C',
      colorB: '#E74C3C'
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Maçları Listele
export const getMatchesByStatus = async (status) => {
  try {
    const now = new Date().toISOString();
    const matchesRef = collection(db, "matches");
    let q;

    if (status === 'upcoming') {
      q = query(matchesRef, where("date", ">=", now), orderBy("date", "asc"));
    } else {
      q = query(matchesRef, where("date", "<", now), orderBy("date", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const matches = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    return matches;
  } catch (error) {
    console.error("Maç çekme hatası: ", error);
    throw error;
  }
};

// Maç Detayı
export const getMatchDetails = async (matchId) => {
    const docRef = doc(db, "matches", matchId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    throw new Error("Maç bulunamadı");
};

// Takıma Katıl / Değiştir
export const joinOrSwitchTeam = async (matchId, targetTeam, playerData) => {
    const matchRef = doc(db, "matches", matchId);
    const playerMinData = {
        id: playerData.id,
        fullName: playerData.fullName,
        position: playerData.position || '?',
        rating: playerData.rating || 5.0
    };

    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(matchRef);
            if (!sfDoc.exists()) throw "Maç bulunamadı!";

            const data = sfDoc.data();
            const teamA = data.teamA || [];
            const teamB = data.teamB || [];
            
            const targetArray = targetTeam === 'A' ? teamA : teamB;
            const otherArray = targetTeam === 'A' ? teamB : teamA;

            if (targetArray.some(p => p.id === playerData.id)) return; 

            const newOtherArray = otherArray.filter(p => p.id !== playerData.id);
            const newTargetArray = [...targetArray, playerMinData];

            if (targetTeam === 'A') {
                transaction.update(matchRef, { teamA: newTargetArray, teamB: newOtherArray });
            } else {
                transaction.update(matchRef, { teamA: newOtherArray, teamB: newTargetArray });
            }
        });
    } catch (e) {
        throw e;
    }
};

// Takımdan Ayrıl
export const leaveMatch = async (matchId, playerData) => {
    const matchRef = doc(db, "matches", matchId);
    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(matchRef);
        if (!sfDoc.exists()) return;
        const data = sfDoc.data();
        const newTeamA = (data.teamA || []).filter(p => p.id !== playerData.id);
        const newTeamB = (data.teamB || []).filter(p => p.id !== playerData.id);
        transaction.update(matchRef, { teamA: newTeamA, teamB: newTeamB });
    });
};

// Misafir Oyuncu Ekle (Eksik olan buydu)
export const addGuestPlayer = async (matchId, team, guestName, guestRating) => {
    const matchRef = doc(db, "matches", matchId);
    const guestId = "guest_" + Date.now();
    const guestData = {
        id: guestId,
        fullName: guestName + " (M)",
        position: 'Misafir',
        rating: parseFloat(guestRating) || 5.0
    };
    const field = team === 'A' ? 'teamA' : 'teamB';
    await updateDoc(matchRef, {
        [field]: arrayUnion(guestData)
    });
};

// Organizatörün Oyuncu Atması (Yeni)
export const kickPlayer = async (matchId, team, playerId) => {
    const matchRef = doc(db, "matches", matchId);
    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(matchRef);
            if (!sfDoc.exists()) throw "Maç bulunamadı!";
            const data = sfDoc.data();
            const teamArray = team === 'A' ? data.teamA : data.teamB;
            const updatedTeamArray = teamArray.filter(player => player.id !== playerId);
            
            if (team === 'A') {
                transaction.update(matchRef, { teamA: updatedTeamArray });
            } else {
                transaction.update(matchRef, { teamB: updatedTeamArray });
            }
        });
    } catch (e) {
        throw e;
    }
};

export const updateTeamColor = async (matchId, team, color) => {
    const matchRef = doc(db, "matches", matchId);
    const field = team === 'A' ? 'colorA' : 'colorB';
    await updateDoc(matchRef, { [field]: color });
};

export const balanceTeamsAlgorithm = async (matchId) => {
    const matchRef = doc(db, "matches", matchId);
    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(matchRef);
        if (!sfDoc.exists()) return;
        const data = sfDoc.data();
        const allPlayers = [...(data.teamA || []), ...(data.teamB || [])];
        allPlayers.sort((a, b) => b.rating - a.rating);
        const newTeamA = [];
        const newTeamB = [];
        let ratingA = 0;
        let ratingB = 0;
        allPlayers.forEach(player => {
            if (ratingA <= ratingB) {
                newTeamA.push(player);
                ratingA += player.rating;
            } else {
                newTeamB.push(player);
                ratingB += player.rating;
            }
        });
        transaction.update(matchRef, { teamA: newTeamA, teamB: newTeamB });
    });
};

export const deleteMatch = async (matchId) => {
    await deleteDoc(doc(db, "matches", matchId));
};

export const checkAndProcessExpiredMatches = async () => {
    const now = new Date().toISOString();
    const matchesRef = collection(db, "matches");

    // Sorgu: Tarihi geçmiş (date < now) AMA hala durumu 'upcoming' olanlar
    const q = query(
        matchesRef, 
        where("status", "==", "upcoming"),
        where("date", "<", now)
    );

    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) return; // İşlenecek maç yok

        // Her bir bitmiş maçı tek tek işle
        for (const matchDoc of snapshot.docs) {
            const matchId = matchDoc.id;
            const matchData = matchDoc.data();

            // Transaction ile güvenli güncelleme (Çakışmayı önler)
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(doc(db, "matches", matchId));
                if (!sfDoc.exists()) return;

                // Tekrar kontrol et (Belki başka kullanıcı o sırada güncellemiştir)
                if (sfDoc.data().status === 'completed') return;

                // 1. Maç durumunu 'completed' yap
                transaction.update(doc(db, "matches", matchId), { status: 'completed' });

                // 2. Oyuncuların maç sayısını artır
                const allPlayers = [...(matchData.teamA || []), ...(matchData.teamB || [])];
                
                for (const player of allPlayers) {
                    // Sadece gerçek kullanıcıları güncelle (Misafirleri atla)
                    if (!player.id.toString().startsWith("guest_")) {
                        const playerRef = doc(db, "players", player.id);
                        transaction.update(playerRef, {
                            matchCount: increment(1)
                        });
                    }
                }
            });
        }
    } catch (error) {
        console.error("Otomatik maç güncelleme hatası:", error);
        // Kullanıcıya hata göstermeye gerek yok, sessizce fail olabilir
    }
};