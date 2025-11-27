import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { checkNewBadges } from '../utils/badges';

export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "players", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("Kullanıcı bulunamadı!");
    }
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updateData) => {
    try {
        const userRef = doc(db, "players", userId);
        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        throw error;
    }
};

export const updateUserBadges = async (userId) => {
    try {
        const userRef = doc(db, "players", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return;
        
        const userData = userSnap.data();
        const newEarnedBadges = checkNewBadges(userData);

        if (newEarnedBadges.length > 0) {
            await updateDoc(userRef, {
                badges: arrayUnion(...newEarnedBadges)
            });
            return newEarnedBadges; // Yeni kazanılanları döndür (Belki ekranda kutlama yaparız)
        }
        return [];
    } catch (error) {
        console.error("Rozet güncelleme hatası:", error);
    }
};

export const getLeaderboard = async () => {
    try {
        const playersRef = collection(db, "players");
        
        // Kural: En az 3 maça çıkmış olsun, Puana göre sırala, İlk 20 kişiyi getir
        const q = query(
            playersRef,
            where("matchCount", ">=", 3),
            orderBy("rating", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const players = [];
        snapshot.forEach(doc => {
            players.push(doc.data());
        });
        
        return players;
    } catch (error) {
        console.error("Liderlik tablosu hatası:", error);
        // Eğer index hatası verirse boş dizi dönelim, konsolda link çıkar
        return []; 
    }
};