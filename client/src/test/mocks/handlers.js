import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:5000/api";

// Mock data
const mockAliens = [
  {
    _id: "1",
    name: "Zephyr the Cosmic Wanderer",
    faction: "Stellar Nomads",
    planet: "Nebula Prime",
    rarity: "Legendary",
    price: 299.99,
    image: "/images/aliens/zephyr.jpg",
    backstory: "A mysterious traveler from the outer rim...",
    abilities: ["Teleportation", "Mind Reading"],
    clothingStyle: "Ethereal Robes",
    featured: true,
    inStock: true,
  },
  {
    _id: "2",
    name: "Blaze the Fire Warrior",
    faction: "Inferno Legion",
    planet: "Pyrion",
    rarity: "Epic",
    price: 199.99,
    image: "/images/aliens/blaze.jpg",
    backstory: "A fierce warrior from the volcanic planet...",
    abilities: ["Fire Control", "Enhanced Strength"],
    clothingStyle: "Battle Armor",
    featured: false,
    inStock: true,
  },
];

const mockUser = {
  _id: "user1",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  isAdmin: false,
  wishlist: [],
};

const mockCart = {
  _id: "cart1",
  user: "user1",
  items: [
    {
      alien: mockAliens[0],
      quantity: 2,
    },
  ],
  totalItems: 2,
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: "mock-jwt-token",
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: "mock-jwt-token",
      },
    });
  }),

  http.get(`${API_BASE_URL}/auth/profile`, () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // Alien endpoints
  http.get(`${API_BASE_URL}/aliens`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const faction = url.searchParams.get("faction");

    let filteredAliens = mockAliens;

    if (search) {
      filteredAliens = filteredAliens.filter(
        (alien) =>
          alien.name.toLowerCase().includes(search.toLowerCase()) ||
          alien.faction.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (faction) {
      filteredAliens = filteredAliens.filter(
        (alien) => alien.faction === faction
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        aliens: filteredAliens,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: filteredAliens.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12,
        },
      },
    });
  }),

  http.get(`${API_BASE_URL}/aliens/featured`, () => {
    return HttpResponse.json({
      success: true,
      data: mockAliens.filter((alien) => alien.featured),
    });
  }),

  http.get(`${API_BASE_URL}/aliens/:id`, ({ params }) => {
    const alien = mockAliens.find((a) => a._id === params.id);
    if (!alien) {
      return HttpResponse.json(
        { success: false, error: { code: "ALIEN_NOT_FOUND" } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: alien,
    });
  }),

  http.get(`${API_BASE_URL}/aliens/:id/related`, ({ params }) => {
    const alien = mockAliens.find((a) => a._id === params.id);
    if (!alien) {
      return HttpResponse.json(
        { success: false, error: { code: "ALIEN_NOT_FOUND" } },
        { status: 404 }
      );
    }
    const related = mockAliens.filter(
      (a) =>
        a._id !== params.id &&
        (a.faction === alien.faction || a.planet === alien.planet)
    );
    return HttpResponse.json({
      success: true,
      data: related,
    });
  }),

  // Cart endpoints
  http.get(`${API_BASE_URL}/cart`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCart,
    });
  }),

  http.post(`${API_BASE_URL}/cart/add`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCart,
    });
  }),

  http.put(`${API_BASE_URL}/cart/update`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCart,
    });
  }),

  http.delete(`${API_BASE_URL}/cart/remove/:id`, () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockCart, items: [] },
    });
  }),

  // Wishlist endpoints
  http.get(`${API_BASE_URL}/wishlist`, () => {
    return HttpResponse.json({
      success: true,
      data: mockAliens.slice(0, 1),
    });
  }),

  http.post(`${API_BASE_URL}/wishlist/add`, () => {
    return HttpResponse.json({
      success: true,
      data: { message: "Added to wishlist" },
    });
  }),

  http.delete(`${API_BASE_URL}/wishlist/remove/:id`, () => {
    return HttpResponse.json({
      success: true,
      data: { message: "Removed from wishlist" },
    });
  }),

  // Order endpoints
  http.post(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        _id: "order1",
        orderNumber: "BM123456",
        totalAmount: 599.98,
        paymentStatus: "completed",
        orderStatus: "processing",
      },
    });
  }),

  http.get(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: "order1",
          orderNumber: "BM123456",
          totalAmount: 599.98,
          paymentStatus: "completed",
          orderStatus: "processing",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),
];
