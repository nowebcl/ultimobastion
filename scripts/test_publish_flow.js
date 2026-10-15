import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')

async function run() {
  console.log('Logging in...')
  await pb.collection('users').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  console.log('Logged in successfully!')

  const existing = await pb.collection('noticias').getList(1, 1, {
    filter: 'slug = "municipalidad-de-maullin-presenta-nuevos-proyectos-para-el-borde-costero"'
  })

  if (existing.totalItems > 0) {
    console.log('Sample news already exists:', existing.items[0].id)
    return
  }

  const fd = new FormData()
  fd.append('title', 'Municipalidad de Maullín presenta nuevos proyectos para el borde costero')
  fd.append('slug', 'municipalidad-de-maullin-presenta-nuevos-proyectos-para-el-borde-costero')
  fd.append('category', 'Actualidad')
  fd.append('author', 'Redacción Último Bastión')
  fd.append('excerpt', 'Autoridades locales anunciaron el inicio de obras que modernizarán los paseos peatonales y accesos fluviales en la comuna.')
  fd.append('content', '<p class="mb-4">Durante la jornada de este martes, autoridades de Maullín junto a dirigentes comunitarios recorrieron el sector de la costanera para presentar la cartera de proyectos de inversión pública 2026.</p><p class="mb-4">La iniciativa contempla luminarias de alta eficiencia, áreas verdes con flora nativa y nuevos miradores con vistas al estuario del Río Maullín, beneficiando a cientos de familias y visitantes.</p><p class="mb-4">El alcalde destacó la importancia del trabajo mancomunado entre las organizaciones sociales y los equipos técnicos municipales para sacar adelante estas obras que refuerzan la identidad de El Último Bastión.</p>')
  fd.append('featured', 'true')
  fd.append('date', new Date().toISOString())

  const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
  const fileBlob = new Blob([dummyBuffer], { type: 'image/png' })
  fd.append('image', fileBlob, 'costanera-maullin.png')
  fd.append('gallery', fileBlob, 'foto-mirador-1.png')
  fd.append('gallery', fileBlob, 'foto-vecinos-2.png')

  const created = await pb.collection('noticias').create(fd)
  console.log('Created sample news in PocketBase!')
  console.log('ID:', created.id)
  console.log('Title:', created.title)
  console.log('Cover image:', created.image)
  console.log('Gallery images count:', created.gallery.length)
}

run().catch(console.error)
