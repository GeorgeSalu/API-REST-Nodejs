test('Devo conchecer as principais assetivas do jest', () => {
    let number = null;
    expect(number).toBeNull();

    number = 10;
    expect(number).not.toBeNull();
    expect(number).toBe(10)
    expect(number).toEqual(10)
    expect(number).toBeGreaterThan(9)
    expect(number).toBeLessThan(11)
});

test('Devo saber trabalhar com objetos', () => {
    const obj = { name: 'john', email: 'john@gmail.com' }
    expect(obj).toHaveProperty('name')
    expect(obj).toHaveProperty('name', 'john')
    expect(obj.name).toBe('john')

    const obj2 = { name: 'john', email: 'john@gmail.com' }
    expect(obj).toEqual(obj2)
})