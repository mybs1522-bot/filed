import { GlassCheckoutCard } from "@/components/ui/glass-checkout-card-shadcnui"
import PricingCard from "@/components/ui/pricing-card"
export { FilesystemItemAnimatedDemo, FilesystemItemDemo } from "@/components/ui/filesystem-demo"
export { PricingCard, GlassCheckoutCard }

export default function Demo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <GlassCheckoutCard amount={20.0} />
    </div>
  )
}
