import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Search, Trash2, Plus, Minus, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function POS() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix">("cash");
  const [discount, setDiscount] = useState(0);

  const restaurantsQuery = trpc.restaurant.list.useQuery();
  const productsQuery = trpc.product.search.useQuery(
    { restaurantId: restaurantId || 0, query: searchQuery },
    { enabled: !!restaurantId && searchQuery.length > 0 }
  );
  const allProductsQuery = trpc.product.list.useQuery(
    { restaurantId: restaurantId || 0 },
    { enabled: !!restaurantId }
  );
  const createOrderMutation = trpc.order.create.useMutation();

  useEffect(() => {
    if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
      setRestaurantId(restaurantsQuery.data[0].id);
    }
  }, [restaurantsQuery.data]);

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find((item) => item.productId === product.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: Number(product.salePrice),
          total: Number(product.salePrice),
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                total: quantity * item.unitPrice,
              }
            : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (!restaurantId || cartItems.length === 0) {
      console.error("Carrinho vazio");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        restaurantId,
        type: "takeout",
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      console.log(`Pedido ${result.orderNumber} finalizado!`);
      setCartItems([]);
      setDiscount(0);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              PDV - Ponto de Venda
            </h1>
            <p className="text-muted-foreground">Registre vendas rapidamente</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(searchQuery.length > 0 ? productsQuery.data : allProductsQuery.data)?.map(
              (product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleAddToCart(product)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-sm mb-2">{product.name}</p>
                    <p className="text-lg font-bold text-primary">
                      R$ {Number(product.salePrice).toFixed(2)}
                    </p>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Carrinho</CardTitle>
              <CardDescription>{cartItems.length} itens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Carrinho vazio
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center text-sm border-b pb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-medium">R$ {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <Label htmlFor="discount">Desconto:</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 h-8"
                    min="0"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || createOrderMutation.isPending}
                className="w-full"
                size="lg"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {createOrderMutation.isPending ? "Processando..." : "Finalizar Venda"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
