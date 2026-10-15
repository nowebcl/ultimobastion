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
  },
  {
    name: "Cabañas & Hospedaje Río Maullín",
    category: "hospedajes",
    categoryName: "Hospedaje & Cabañas",
    location: "Ribera del Río Maullín",
    description: "Cabañas equipadas con vista privilegiada al estuario. Calefacción a leña, estacionamiento privado y acceso directo para bajada de botes y observación de aves del humedal.",
    phone: "+56 9 8452 1190",
    hours: "Atención 24/7 (Reservas previas)",
    featured: false
  },
  {
    name: "Navegaciones Fluviales Quenuir - Lepihué",
    category: "fluvial",
    categoryName: "Transporte Fluvial",
    location: "Muelle de Pasajeros de Maullín",
    description: "Servicios de cruce y tours fotográficos por los laberintos estuarinos y el santuario de la naturaleza. Embarcaciones con matrícula al día y chalecos salvavidas para toda la familia.",
    phone: "+56 9 7321 0044",
    hours: "Lunes a Domingo 07:30 - 19:30",
    featured: false
  },
  {
    name: "Turismo Rural y Senderos Carelmapu",
    category: "rural",
    categoryName: "Turismo Rural",
    location: "Península de Carelmapu",
    description: "Experiencias de recolección de orilla tradicional, curantos al hoyo comunitarios y caminatas guiadas por la playa Brava y el faro.",
    phone: "+56 9 9211 4455",
    hours: "Fines de semana y festivos",
    featured: false
  },
  {
    name: "Transportes Terrestres Maullín - Puerto Montt",
    category: "terrestre",
    categoryName: "Transporte Terrestre",
    location: "Terminal de Buses Maullín",
    description: "Servicio regular de pasajeros y encomiendas entre Maullín, Pargua, Los Muermos y el Terminal de Buses de Puerto Montt con salidas cada 30 minutos.",
    phone: "+56 65 245 1020",
    hours: "Salidas diarias continuadas",
    featured: false
  },
  {
    name: "Expediciones en Kayak Humedales de Maullín",
    category: "excursionismo",
    categoryName: "Excursionismo & Aventura",
    location: "Sector La Pasada",
    description: "Travesías en kayak de travesía y stand up paddle (SUP) por los bosques hundidos. Guías certificados en rescate en aguas abiertas y flora nativa.",
    phone: "+56 9 6632 8812",
    hours: "Temporada permanente",
    featured: false
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
