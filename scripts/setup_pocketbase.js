const base = 'https://bd.maullinultimobastion.cl';
const email = 'maullinbastion@admin.cl';
const password = 'Maullin#2026!Bastion';

async function main() {
  console.log('Authenticating as superuser...');
  const authRes = await fetch(base + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });

  if (!authRes.ok) {
    console.error('Failed to auth:', authRes.status, await authRes.text());
    return;
  }

  const { token } = await authRes.json();
  console.log('Authenticated successfully!');

  // Check existing collections
  const colRes = await fetch(base + '/api/collections', {
    headers: { 'Authorization': token }
  });
  const cols = await colRes.json();
  const existingNames = new Set(cols.items.map(c => c.name));
  console.log('Existing collections:', Array.from(existingNames));

  // 1. Create 'noticias' if it doesn't exist
  if (!existingNames.has('noticias')) {
    console.log('Creating "noticias" collection...');
    const noticiasCol = {
      name: 'noticias',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'slug',
          type: 'text',
          required: true
        },
        {
          name: 'excerpt',
          type: 'text',
          required: false
        },
        {
          name: 'content',
          type: 'editor',
          required: false
        },
        {
          name: 'category',
          type: 'text',
          required: false
        },
        {
          name: 'author',
          type: 'text',
          required: false
        },
        {
          name: 'date',
          type: 'text',
          required: false
        },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          required: false
        },
        {
          name: 'gallery',
          type: 'file',
          maxSelect: 20,
          maxSize: 20971520,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          required: false
        },
        {
          name: 'featured',
          type: 'bool',
          required: false
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_noticias_slug ON noticias (slug)'
      ]
    };

    const res = await fetch(base + '/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(noticiasCol)
    });

    console.log('Create noticias response:', res.status, await res.text());
  } else {
    console.log('"noticias" already exists.');
  }

  // 2. Create 'emprendimientos' if it doesn't exist
  if (!existingNames.has('emprendimientos')) {
    console.log('Creating "emprendimientos" collection...');
    const empCol = {
      name: 'emprendimientos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'category',
          type: 'text',
          required: true
        },
        {
          name: 'categoryName',
          type: 'text',
          required: false
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'location',
          type: 'text',
          required: false
        },
        {
          name: 'phone',
          type: 'text',
          required: false
        },
        {
          name: 'hours',
          type: 'text',
          required: false
        },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          required: false
        },
        {
          name: 'featured',
          type: 'bool',
          required: false
        }
      ]
    };

    const res = await fetch(base + '/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(empCol)
    });

    console.log('Create emprendimientos response:', res.status, await res.text());
  } else {
    console.log('"emprendimientos" already exists.');
  }
}

main().catch(console.error);
