// Rozet Tanımları
// condition fonksiyonu true dönerse kullanıcı bu rozeti kazanır.
export const BADGE_DEFINITIONS = [
  {
    id: 'first_match',
    title: 'Çaylak',
    description: 'İlk maçını tamamladın.',
    icon: 'footsteps', // Ionicons ismi
    color: '#3498DB', // Mavi
    condition: (user) => user.matchCount >= 1
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: '10 maça çıktın, artık sahaların tozunu yuttun.',
    icon: 'ribbon', 
    color: '#9B59B6', // Mor
    condition: (user) => user.matchCount >= 10
  },
  {
    id: 'star_player',
    title: 'Yıldız',
    description: 'Ortalama puanın 8.0 üzeri!',
    icon: 'star', 
    color: '#F1C40F', // Altın
    condition: (user) => user.rating >= 8.0 && user.matchCount >= 3
  },
  {
    id: 'organizer',
    title: 'Kaptan',
    description: 'Maç organizasyonu yaptın.',
    icon: 'megaphone', 
    color: '#E74C3C', // Kırmızı
    condition: (user) => user.isOrganizer === true // Bunu createMatch yapanlara ekleyebiliriz
  }
];

// Kullanıcının hak ettiği ama sahip olmadığı rozetleri bulur
export const checkNewBadges = (user) => {
    const currentBadges = user.badges || []; // Mevcut rozet ID'leri ['first_match'] gibi
    const newBadges = [];

    BADGE_DEFINITIONS.forEach(badge => {
        // Eğer bu rozete zaten sahip değilse VE şartı sağlıyorsa
        if (!currentBadges.includes(badge.id) && badge.condition(user)) {
            newBadges.push(badge.id);
        }
    });

    return newBadges;
};