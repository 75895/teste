import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Criar restaurante de teste
  const [restaurantResult] = await connection.execute(
    `INSERT INTO restaurants (name, address, phone, email, cnpj, owner, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    ['Silvess Restaurant', 'Rua Exemplo, 123', '(11) 99999-9999', 'contato@silvess.com', '12.345.678/0001-90', 'Erlon Freitas']
  );

  const restaurantId = restaurantResult.insertId;
  console.log(`✅ Restaurante criado com ID: ${restaurantId}`);

  // Criar mesas
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const capacity = i <= 4 ? 2 : i <= 7 ? 4 : 6;
    tables.push([`${i}`, capacity, restaurantId, 'available']);
  }

  for (const table of tables) {
    await connection.execute(
      `INSERT INTO tables (tableNumber, capacity, restaurantId, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      table
    );
  }
  console.log(`✅ 10 mesas criadas com sucesso`);

  // Criar categorias de produtos
  const categories = [
    ['Bebidas', restaurantId],
    ['Pratos Principais', restaurantId],
    ['Acompanhamentos', restaurantId],
    ['Sobremesas', restaurantId],
    ['Bebidas Alcoólicas', restaurantId],
  ];

  const categoryIds = [];
  for (const category of categories) {
    const [result] = await connection.execute(
      `INSERT INTO productCategories (name, restaurantId, createdAt, updatedAt) 
       VALUES (?, ?, NOW(), NOW())`,
      category
    );
    categoryIds.push(result.insertId);
  }
  console.log(`✅ 5 categorias de produtos criadas`);

  // Criar produtos
  const products = [
    // Bebidas
    ['Refrigerante', 'Refrigerante gelado', categoryIds[0], restaurantId, 5.00, 5.50, 50],
    ['Suco Natural', 'Suco natural da fruta', categoryIds[0], restaurantId, 8.00, 10.00, 30],
    ['Água', 'Água mineral', categoryIds[0], restaurantId, 2.00, 3.00, 100],
    ['Cerveja', 'Cerveja gelada', categoryIds[4], restaurantId, 8.00, 12.00, 60],
    
    // Pratos Principais
    ['Frango à Parmegiana', 'Frango empanado com molho de tomate e queijo', categoryIds[1], restaurantId, 35.00, 45.00, 20],
    ['Bife à Milanesa', 'Bife fino à milanesa', categoryIds[1], restaurantId, 40.00, 55.00, 15],
    ['Peixe Grelhado', 'Peixe fresco grelhado', categoryIds[1], restaurantId, 50.00, 65.00, 10],
    ['Pasta Carbonara', 'Massa fresca com molho carbonara', categoryIds[1], restaurantId, 38.00, 48.00, 25],
    
    // Acompanhamentos
    ['Arroz', 'Arroz branco', categoryIds[2], restaurantId, 5.00, 8.00, 50],
    ['Feijão', 'Feijão carioca', categoryIds[2], restaurantId, 5.00, 8.00, 40],
    ['Batata Frita', 'Batata frita crocante', categoryIds[2], restaurantId, 12.00, 18.00, 35],
    
    // Sobremesas
    ['Pudim de Leite', 'Pudim caseiro', categoryIds[3], restaurantId, 8.00, 12.00, 20],
    ['Brownie', 'Brownie de chocolate', categoryIds[3], restaurantId, 10.00, 15.00, 25],
    ['Sorvete', 'Sorvete variado', categoryIds[3], restaurantId, 12.00, 18.00, 30],
  ];

  for (const product of products) {
    await connection.execute(
      `INSERT INTO products (name, description, categoryId, restaurantId, costPrice, salePrice, stock, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      product
    );
  }
  console.log(`✅ 14 produtos criados com sucesso`);

  console.log('\n✨ Dados de teste criados com sucesso!');
  console.log('Agora você pode acessar a página de Mesas e testar a funcionalidade completa.');

} catch (error) {
  console.error('❌ Erro ao criar dados de teste:', error.message);
} finally {
  await connection.end();
}
