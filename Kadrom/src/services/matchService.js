import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  where, // Bu eksikti, şimdi eklendi
  orderBy, 
  arrayUnion, 
  arrayRemove, 
  runTransaction 
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

// Yeni Maç Oluştur
export const createMatch = async (matchData) => {
  try {
    const docRef = await addDoc(collection(db, "matches"), {
      ...matchData,
      createdBy: auth.currentUser.uid, // YENİ: Maçı kimin oluşturduğunu kaydediyoruz
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

// Duruma Göre Maçları Getir (Gelecek veya Geçmiş)
export const getMatchesByStatus = async (status) => {
  try {
    const now = new Date().toISOString();
    const matchesRef = collection(db, "matches");
    let q;

    if (status === 'upcoming') {
      // Gelecek Maçlar: Tarihi şu andan büyük olanlar (Yakından uzağa)
      q = query(
        matchesRef, 
        where("date", ">=", now), 
        orderBy("date", "asc")
      );
    } else {
      // Geçmiş Maçlar: Tarihi şu andan küçük olanlar (Yeniden eskiye)
      q = query(
        matchesRef, 
        where("date", "<", now), 
        orderBy("date", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const matches = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    
    return matches;
  } catch (error) {
    console.error("Maç çekme hatası: ", error);
    throw error; // Hatayı fırlatalım ki UI yakalayabilsin
  }
};

// Maç Detayını Getir
export const getMatchDetails = async (matchId) => {
    const docRef = doc(db, "matches", matchId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    throw new Error("Maç bulunamadı");
};

// Takım Değiştirme ve Katılma Mantığı
export const joinOrSwitchTeam = async (matchId, targetTeam, playerData) => {
    const matchRef = doc(db, "matches", matchId);
    
    // Veritabanına kaydedilecek minimal oyuncu verisi
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
            
            // Hedef ve Diğer takım dizilerini belirle
            const targetArray = targetTeam === 'A' ? teamA : teamB;
            const otherArray = targetTeam === 'A' ? teamB : teamA;

            // 1. Oyuncu zaten hedef takımda mı?
            if (targetArray.some(p => p.id === playerData.id)) {
                return; 
            }

            // 2. Oyuncu diğer takımda mı? (Varsa oradan sil)
            const newOtherArray = otherArray.filter(p => p.id !== playerData.id);

            // 3. Hedef takıma ekle
            const newTargetArray = [...targetArray, playerMinData];

            // 4. Güncelle
            if (targetTeam === 'A') {
                transaction.update(matchRef, { teamA: newTargetArray, teamB: newOtherArray });
            } else {
                transaction.update(matchRef, { teamA: newOtherArray, teamB: newTargetArray });
            }
        });
    } catch (e) {
        console.error("Takım değiştirme hatası", e);
        throw e;
    }
};

// Takımdan Tamamen Çıkma
export const leaveMatch = async (matchId, playerData) => {
    const matchRef = doc(db, "matches", matchId);
    
    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(matchRef);
        if (!sfDoc.exists()) return;

        const data = sfDoc.data();
        // İki takımdan da filtreleyerek sil
        const newTeamA = (data.teamA || []).filter(p => p.id !== playerData.id);
        const newTeamB = (data.teamB || []).filter(p => p.id !== playerData.id);

        transaction.update(matchRef, { teamA: newTeamA, teamB: newTeamB });
    });
};

// Forma Rengi Güncelleme
export const updateTeamColor = async (matchId, team, color) => {
    const matchRef = doc(db, "matches", matchId);
    const field = team === 'A' ? 'colorA' : 'colorB';
    await updateDoc(matchRef, { [field]: color });
};

// Otomatik Dengeleme Algoritması
export const balanceTeamsAlgorithm = async (matchId) => {
    const matchRef = doc(db, "matches", matchId);

    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(matchRef);
        if (!sfDoc.exists()) return;

        const data = sfDoc.data();
        // Tüm oyuncuları birleştir
        const allPlayers = [...(data.teamA || []), ...(data.teamB || [])];

        // Puana göre sırala (En yüksekten en düşüğe)
        allPlayers.sort((a, b) => b.rating - a.rating);

        const newTeamA = [];
        const newTeamB = [];
        let ratingA = 0;
        let ratingB = 0;

        // Dağıt (Greedy yaklaşımı: Zayıf kalan takıma sıradaki en iyiyi ver)
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
    try {
        await deleteDoc(doc(db, "matches", matchId));
    } catch (error) {
        console.error("Silme hatası:", error);
        throw error;
    }
};