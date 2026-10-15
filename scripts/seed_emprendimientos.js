const base = 'https://bd.maullinultimobastion.cl';
const email = 'maullinbastion@admin.cl';
const password = 'Maullin#2026!Bastion';

const directoryItems = [
  {
    name: "Derniere Restobar",
    category: "restaurantes",
    categoryName: "Restaurante & Bar",
    location: "Maullín Centro (Calle O'Higgins)",
    description: "Un nuevo punto de encuentro para disfrutar en la ciudad. Si buscas un lugar acogedor para compartir con amigos, disfrutar de excelente gastronomía marina y cócteles de autor en un ambiente moderno y cercano.",
    phone: "+56 9 9510 4318",
    hours: "Miércoles a Domingo 18:00 - 02:00",
    featured: true
  }
];

async function seed() {
  const authRes = await fetch(base + '/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });
  const { token } = await authRes.json();

  // Check if any existing
  const checkRes = await fetch(base + '/api/collections/emprendimientos/records?perPage=1');
  const checkData = await checkRes.json();
  if (checkData.totalItems > 0) {
    console.log('Emprendimientos already have records (' + checkData.totalItems + '), skipping seed.');
    return;
  }

  for (const item of directoryItems) {
    const res = await fetch(base + '/api/collections/emprendimientos/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(item)
    });
    console.log('Seeded:', item.name, res.status);
  }
  console.log('Seeding complete!');
}

seed().catch(console.error);
