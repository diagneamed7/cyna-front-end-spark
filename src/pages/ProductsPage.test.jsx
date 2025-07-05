// FrontEnd/src/pages/ProductsPage.test.jsx

// Mock global fetch
beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.resetAllMocks();
});

test('affiche le titre de la page', () => {
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve([]),
    });
    render(<ProductsPage />);
    expect(screen.getByText(/Liste des produits/i)).toBeInTheDocument();
});

test('affiche les produits récupérés', async () => {
    const fakeProducts = [
        { id: 1, nom: 'Produit A', prix: 10 },
        { id: 2, nom: 'Produit B', prix: 20 },
    ];
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(fakeProducts),
    });

    render(<ProductsPage />);
    for (const product of fakeProducts) {
        await waitFor(() =>