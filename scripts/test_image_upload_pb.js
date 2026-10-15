import PocketBase from 'pocketbase'
import sharp from 'sharp'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')

async function testUpload() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  const sampleUrl = 'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/DSC_0191-1024x678.jpg'
  console.log('Descargando imagen de prueba...')
  const res = await fetch(sampleUrl)
  const arrayBuf = await res.arrayBuffer()
  const rawBuf = Buffer.from(arrayBuf)

  console.log('Optimizando a WebP...')
  const webpBuf = await sharp(rawBuf)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer()

  console.log('Subiendo a PocketBase coleccion imagenes_noticias...')
  const fd = new FormData()
  const blob = new Blob([webpBuf], { type: 'image/webp' })
  fd.append('archivo', blob, 'test_dsc_0191.webp')
  fd.append('url_original', sampleUrl)
  fd.append('noticia_id', 'test_post')

  const record = await pb.collection('imagenes_noticias').create(fd)
  console.log('Registro creado:', record.id)
  const fileUrl = pb.files.getURL(record, record.archivo)
  console.log('URL pública en la Base de Datos:', fileUrl)

  // Verify URL works
  const checkRes = await fetch(fileUrl)
  console.log('HTTP Status de la imagen en PocketBase:', checkRes.status, checkRes.headers.get('content-type'))
}

testUpload().catch(console.error)
