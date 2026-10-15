import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')

async function createCol() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  const cols = await pb.collections.getFullList()
  if (cols.some(c => c.name === 'imagenes_noticias')) {
    console.log('Collection "imagenes_noticias" ya existe.')
    return
  }

  const created = await pb.collections.create({
    name: 'imagenes_noticias',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'archivo',
        type: 'file',
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
        required: true
      },
      {
        name: 'url_original',
        type: 'text',
        required: false
      },
      {
        name: 'noticia_id',
        type: 'text',
        required: false
      }
    ],
    indexes: [
      'CREATE INDEX idx_img_url_orig ON imagenes_noticias (url_original)'
    ]
  })
  console.log('Colección creada con éxito:', created.name, created.id)
}

createCol().catch(console.error)
