import { doc, runTransaction, increment } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Tek bir oyuncuya puan verip ortalamasını güncelleme
// Transaction kullanarak aynı anda puan verilirse hata olmasını engelliyoruz.
const ratePlayer = async (transaction, playerId, score) => {
    const playerRef = doc(db, "players", playerId);
    const playerDoc = await transaction.get(playerRef);

    if (!playerDoc.exists()) return;

    const data = playerDoc.data();
    // Eğer daha önce hiç puan almamışsa değerleri başlat
    const currentRating = data.rating || 5.0;
    const totalVotes = data.totalVotes || 0; // Toplam kaç kişi puan vermiş
    
    // Yeni Ortalamayı Hesapla
    // Formül: ((EskiOrtalama * OySayısı) + YeniPuan) / (OySayısı + 1)
    // Ancak 5.0 varsayılan başlangıç olduğu için, ilk oylarda 5'in ağırlığını kırmamız lazım.
    // Basitlik adına: Weighted Average kullanalım.
    
    const newTotalVotes = totalVotes + 1;
    // Eğer ilk oysa direkt verilen puanı kabul et, değilse ortalama al
    const newRating = totalVotes === 0 ? score : ((currentRating * totalVotes) + score) / newTotalVotes;

    transaction.update(playerRef, {
        rating: newRating,
        totalVotes: newTotalVotes,
        // Maç sayısını burada arttırmıyoruz, onu maç bittiğinde ayrı arttırabiliriz veya burada da arttırabiliriz.
        // Şimdilik sadece rating odaklıyız.
    });
};

// Toplu Puanlama (Tüm listeyi döner)
export const submitBatchRatings = async (ratingsList) => {
    // ratingsList: [{ userId: '123', score: 8 }, { userId: '456', score: 6 }]
    
    try {
        await runTransaction(db, async (transaction) => {
            for (const item of ratingsList) {
                await ratePlayer(transaction, item.userId, item.score);
            }
        });
    } catch (error) {
        console.error("Puanlama hatası:", error);
        throw error;
    }
};