import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function checkPB() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  
  const sample = await pb.collection('noticias').getList(1, 5, {
    fields: 'id,title,slug,content'
  })
  
  console.log('Sample posts in PocketBase:')
  for (const item of sample.items) {
    const hasImgs = /<img[^>]+src=["']([^"']+)["']/i.test(item.content || '')
    console.log(`- ID: ${item.id} | Slug: ${item.slug} | Content length: ${(item.content || '').length} | Has images: ${hasImgs}`)
  }
}

checkPB().catch(console.error)
