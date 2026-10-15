import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')

async function run() {
  const list = await pb.collection('noticias').getList(1, 1)
  const post = list.items[0]
  console.log('Post ID:', post.id, 'Image:', post.image)
  const thumbUrl = `https://bd.maullinultimobastion.cl/api/files/noticias/${post.id}/${post.image}?thumb=120x90`
  const res = await fetch(thumbUrl)
  const buf = await res.arrayBuffer()
  console.log('Thumb status:', res.status, 'Type:', res.headers.get('content-type'), 'Size:', buf.byteLength, 'bytes')
}

run().catch(console.error)
