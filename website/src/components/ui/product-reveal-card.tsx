"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Product } from "@/components/shop/shop-data"

interface ProductRevealCardProps {
  product: Product
  isFavorite?: boolean
  isJustAdded?: boolean
  onAdd?: () => void
  onFavorite?: () => void
  onQuickView?: () => void
  enableAnimations?: boolean
  className?: string
}

export function ProductRevealCard({
  product,
  isFavorite = false,
  isJustAdded = false,
  onAdd,
  onFavorite,
  onQuickView,
  enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0

  const displayFeatures = product.features.slice(0, 2)

  const containerVariants: Variants = {
    rest: {
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate
      ? {
          scale: 1.03,
          y: -8,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          } as const,
        }
      : {},
  }

  const imageVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
  }

  const overlayVariants: Variants = {
    rest: {
      y: "100%",
      opacity: 0,
      filter: "blur(4px)",
    },
    hover: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      } as const,
    },
  }

  const contentVariants: Variants = {
    rest: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    hover: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      } as const,
    },
  }

  const buttonVariantsMotion: Variants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate
      ? {
          scale: 1.05,
          y: -2,
          transition: { type: "spring", stiffness: 400, damping: 25 } as const,
        }
      : {},
    tap: shouldAnimate ? { scale: 0.95 } : {},
  }

  const favoriteVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    favorite: {
      scale: [1, 1.3, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  }

  return (
    <motion.div
      data-slot="product-reveal-card"
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-full rounded-xl   bg-white/10 text-white overflow-hidden",
        "shadow-lg shadow-black/20 cursor-pointer group",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <motion.img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover"
          variants={imageVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

       

        {discountPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 z-10 flex gap-2"
          >
            
          </motion.div>
        )}
        {discountPercent === 0 && product.badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 z-10"
          >
            <span className="accent-gradient text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {product.badge}
            </span>
          </motion.div>
        )}
      </div>

      <div className="p-5 space-y-3">
       
        <div className="space-y-1">
          <motion.h3
            onClick={(e) => {
              e.stopPropagation()
              onQuickView?.()
            }}
            className="text-lg font-bold leading-tight font-display cursor-pointer hover:text-[#cf9448] transition-colors text-white"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {product.name}
          </motion.h3>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#cf9448]">
              £{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-white/60 line-through">
                £{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.()
          }}
          variants={buttonVariantsMotion}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "w-full h-11 font-medium text-xs lg:hidden shadow-lg shadow-[#cf9448]/25",
            isJustAdded ? "!bg-emerald-600 !bg-none" : "",
          )}
        >
          {isJustAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>

      <motion.div
        variants={overlayVariants}
        className="absolute inset-0 bg-[#2a1c12]/98 flex flex-col justify-end z-20 pointer-events-none"
      >
        <div className="p-5 space-y-4 pointer-events-auto">
          <motion.div variants={contentVariants}>
            <h4 className="font-semibold mb-2 font-display text-white">
              Product Details
            </h4>
            <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
              {product.shortDesc}
            </p>
          </motion.div>

          {displayFeatures.length > 0 && (
            <motion.div variants={contentVariants}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {displayFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 rounded-lg p-2.5 text-center  "
                  >
                    <div className="font-semibold text-white line-clamp-1">
                      {feat.split(":")[0].split("—")[0].trim()}
                    </div>
                    <div className="text-white/60 text-[10px] mt-0.5 line-clamp-2">
                      {feat
                        .split(":")
                        .slice(1)
                        .join(":")
                        .split("—")[0]
                        .trim() || feat.slice(0, 40)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={contentVariants} className="space-y-2.5">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onAdd?.()
              }}
              variants={buttonVariantsMotion}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full h-12 font-medium text-sm",
                isJustAdded ? "!bg-emerald-600 !bg-none" : "",
                "shadow-lg shadow-[#cf9448]/25",
              )}
            >
              {isJustAdded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </motion.button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickView?.()
              }}
              className="w-full h-10 font-medium text-xs text-white/70 hover:text-white transition-colors"
            >
              View Full Details
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
