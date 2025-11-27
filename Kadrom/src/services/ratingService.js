import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Toplu Puanlama (Transaction Kurallarına Uygun)
export const submitBatchRatings = async (ratingsList) => {
    // ratingsList: [{ userId: '123', score: 8 }, { userId: '456', score: 6 }]
    
    try {
        await runTransaction(db, async (transaction) => {
            const updates = []; // Yazılacak verileri geçici olarak burada tutacağız

            // 1. ADIM: TÜM OKUMALARI YAP (READS)
            // Bu aşamada asla "set" veya "update" kullanmıyoruz.
            for (const item of ratingsList) {
                const playerRef = doc(db, "players", item.userId);
                const playerDoc = await transaction.get(playerRef);

                if (playerDoc.exists()) {
                    const data = playerDoc.data();
                    
                    // Hesaplamaları yap
                    const currentRating = data.rating || 5.0;
                    const totalVotes = data.totalVotes || 0;
                    
                    const newTotalVotes = totalVotes + 1;
                    // Weighted Average (Ağırlıklı Ortalama) Hesabı
                    const newRating = totalVotes === 0 
                        ? item.score 
                        : ((currentRating * totalVotes) + item.score) / newTotalVotes;

                    // Güncellenecek referansı ve veriyi sakla (Henüz yazma!)
                    updates.push({
                        ref: playerRef,
                        data: {
                            rating: newRating,
                            totalVotes: newTotalVotes
                        }
                    });
                }
            }

            // 2. ADIM: TÜM YAZMALARI YAP (WRITES)
            // Okuma işlemleri bittiği için artık güvenle yazabiliriz.
            for (const update of updates) {
                transaction.update(update.ref, update.data);
            }
        });
    } catch (error) {
        console.error("Puanlama hatası:", error);
        throw error;
    }
};