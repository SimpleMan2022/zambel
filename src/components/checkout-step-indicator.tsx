"use client"

export function CheckoutStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
              step <= currentStep ? "bg-primary-red" : "bg-pink-200"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 transition-all ${step < currentStep ? "bg-primary-red" : "bg-pink-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
