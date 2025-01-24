"use client"

import * as React from "react"
import { OTPInput, OTPInputContext, OTPInputProps } from "input-otp"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  OTPInputProps & { containerClassName?: string }
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
InputOTPGroup.displayName = "InputOTPGroup"

type InputOTPSlotProps = React.ComponentPropsWithoutRef<"div"> & {
  char?: string | null
  hasFakeCaret?: boolean
  isActive?: boolean
}

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  InputOTPSlotProps
>(({ className, char, hasFakeCaret, isActive, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-10 h-12 text-center text-base font-medium",
        "border border-input rounded-md focus-within:border-primary",
        "transition-all duration-100",
        isActive && "border-primary ring-1 ring-primary",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-4 w-px bg-foreground" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    role="separator" 
    className={cn("flex items-center", className)}
    {...props}
  >
    <div className="w-2 h-2 rounded-full bg-muted" />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } 