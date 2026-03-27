"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { productsEndpointBase } from "@/src/features/products/services/endpoints";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";

type ProductOption = {
  id: number;
  name: string;
};

type ProductPickerModalProps = {
  open: boolean;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  onClose: () => void;
  onConfirm: (product: { product: number; quantity_used: number; product_name: string }) => void;
};

export function ProductPickerModal({
  open,
  accessToken,
  fetchWithAuth,
  onClose,
  onConfirm,
}: ProductPickerModalProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (!open || !accessToken) return;
    const controller = new AbortController();

    const fetch_ = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(productsEndpointBase);
        url.searchParams.set("use_type", "interno");
        url.searchParams.set("type", "insumo");
        if (searchInput) url.searchParams.set("search", searchInput);

        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
        const data = await response.json();
        const list: ProductOption[] = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        setProducts(list);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar produtos.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetch_();
    return () => controller.abort();
  }, [open, accessToken, fetchWithAuth, searchInput]);

  const handleClose = () => {
    setSelectedId(null);
    setQuantity("1");
    setSearchInput("");
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedId) {
      setError("Selecione um produto.");
      return;
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }
    const picked = products.find((p) => p.id === selectedId);
    onConfirm({
      product: selectedId,
      quantity_used: qty,
      product_name: picked?.name ?? "",
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Selecionar produto" subtitle="Produtos internos">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-2xl border border-white/10 bg-transparent py-3 pl-9 pr-4 text-sm outline-none focus:border-white/40"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-white/60">Nenhum produto encontrado.</p>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {products.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                    selectedId === product.id
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 text-white/80"
                  }`}
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedId ? (
          <label className="block text-sm text-white/70">
            Quantidade
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
