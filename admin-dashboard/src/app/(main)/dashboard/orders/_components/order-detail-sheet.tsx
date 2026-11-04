"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, MapPin, Package, Truck, User, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const orderUpdateSchema = z.object({
  status: z.string(),
  notes: z.string().optional(),
});

type OrderUpdateFormData = z.infer<typeof orderUpdateSchema>;

interface OrderDetailSheetProps {
  orderId: string;
  onClose: () => void;
}

interface Order {
  id: string;
  status: string;
  total: string;
  subtotal: string | null;
  shipping_cost: string | null;
  tax_amount: string | null;
  discount_amount: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: any;
  billing_address: any;
  notes: string | null;
  created_at: string;
  items: any[];
  discounts: any[];
  shipping: any;
  payments: any[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  payment_processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  fulfilling: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  payment_failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const form = useForm<OrderUpdateFormData>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data);
      form.setValue("status", data.status);
      form.setValue("notes", data.notes || "");
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OrderUpdateFormData) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update order");
      toast.success("Order updated");
      fetchOrder();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const [transitioning, setTransitioning] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const handleTransition = async (toStatus: string, trackNum?: string, trackUrl?: string) => {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: toStatus,
          trackingNumber: trackNum,
          trackingUrl: trackUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Status transition failed");
      }
      toast.success(`Order moved to ${toStatus.replace(/_/g, " ")}`);
      setShowShippingModal(false);
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTransitioning(false);
    }
  };

  const handleRefund = async () => {
    if (
      !confirm(
        "Are you sure you want to process a full refund for this order? This will invoke the Stripe refund API and restore inventory.",
      )
    ) {
      return;
    }
    setTransitioning(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin initiated refund", restockItems: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Refund failed");
      }
      toast.success("Order refunded and items restocked");
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund");
    } finally {
      setTransitioning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order Details</h2>
          <p className="text-muted-foreground text-sm">ID: {order.id}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="payment_processing">Payment Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="fulfilling">Fulfilling</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="refunded" disabled>
                      Refunded
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add internal notes about this order..." {...form.register("notes")} />
              </div>

              <Button type="submit" disabled={updating}>
                {updating ? "Updating..." : "Update Order"}
              </Button>
            </form>

            <Separator className="my-4" />

            {/* State Machine Actions */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fulfillment & State Workflow
              </Label>
              <div className="flex flex-wrap gap-2">
                {order.status === "paid" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={transitioning}
                    onClick={() => handleTransition("fulfilling")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Start Fulfilling
                  </Button>
                )}

                {order.status === "fulfilling" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={transitioning}
                    onClick={() => setShowShippingModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Mark as Shipped...
                  </Button>
                )}

                {order.status === "shipped" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={transitioning}
                    onClick={() => handleTransition("delivered")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark as Delivered
                  </Button>
                )}

                {order.status === "pending" && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={transitioning}
                    onClick={() => handleTransition("cancelled")}
                  >
                    Cancel Order
                  </Button>
                )}

                {["paid", "fulfilling", "shipped", "delivered"].includes(order.status) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={transitioning}
                    onClick={handleRefund}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Process Refund
                  </Button>
                )}
              </div>

              {/* Shipping input modal */}
              {showShippingModal && (
                <div className="p-3.5 rounded-lg border bg-muted/40 space-y-3 mt-3">
                  <p className="text-xs font-semibold">Enter Dispatch & Tracking Details</p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Tracking number (e.g. GB123456789)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Carrier URL (e.g. https://www.royalmail.com/...)"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowShippingModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={transitioning}
                      onClick={() => handleTransition("shipped", trackingNumber, trackingUrl)}
                    >
                      Confirm Shipped
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={STATUS_COLORS[order.status] || ""}>{order.status.replace(/_/g, " ")}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(order.created_at)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">£{order.subtotal || order.total}</span>
            </div>
            {order.shipping_cost && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">£{order.shipping_cost}</span>
              </div>
            )}
            {order.tax_amount && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">£{order.tax_amount}</span>
              </div>
            )}
            {order.discount_amount && (
              <div className="flex items-center justify-between text-green-600">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">-£{order.discount_amount}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>£{order.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.shipping_address?.name || "Guest"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customer_email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customer_phone || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.shipping_address ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <div className="text-sm">
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No shipping address provided</p>
            )}
            {order.shipping && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tracking</p>
                  {order.shipping.tracking_number ? (
                    <div>
                      <p className="font-medium">{order.shipping.tracking_number}</p>
                      {order.shipping.tracking_url && (
                        <a
                          href={order.shipping.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Track Package
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tracking number</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × £{item.unit_price}
                      </p>
                    </div>
                    <p className="font-medium">£{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No items in this order</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-4">
                {order.payments.map((payment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">Payment #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{payment.amount}</p>
                      <Badge
                        className={
                          payment.status === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment information available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
