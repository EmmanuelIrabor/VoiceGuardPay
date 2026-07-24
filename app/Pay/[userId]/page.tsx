"use client";
import NavBar from "@/components/NavBar";
import { LockKeyhole, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CirclesThreePlus } from "phosphor-react";
import { paymentService } from "@/lib/api/payment";

// Generate a random transaction ID
function generateTransactionId(): string {
  const prefix = "VG";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 10)}`;
}

// Generate a random account number
function generateAccountNumber(): string {
  const first = Math.floor(Math.random() * 9) + 1;
  const rest = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return `${first}${rest}`;
}

export default function Pay() {
  const router = useRouter();
  const { user_id } = useParams<{ user_id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") ?? "Unknown";
  const recipientId = searchParams.get("recipient_id") ?? "";
  const mandateId = searchParams.get("mandate_id") ?? "";

  // State
  const [accountNumber] = useState(generateAccountNumber);
  const [transactionId] = useState(generateTransactionId);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first PIN input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle PIN change
  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(0, 1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
    setError(""); // Clear error when user types
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for PIN
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split("");
      setPin(newPin);
      inputRefs.current[3]?.focus();
    }
  };

  // Format amount for display
  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Handle payment confirmation using paymentService
  const handleConfirm = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Validate PIN
    const pinCode = pin.join("");
    if (pinCode.length !== 4) {
      setError("Please enter a complete 4-digit PIN");
      return;
    }

    // Validate mandate ID
    if (!mandateId) {
      setError("No mandate found. Please create a mandate first.");
      return;
    }

    // Clear previous errors
    setError("");
    setIsProcessing(true);

    try {
      console.log("Initiating payment...", {
        mandateId,
        amount: amountNum,
        narration: `Payment to ${recipientName}`,
        userId: user_id,
        recipientId: recipientId,
        transactionId: transactionId
      });

      // USING THE PAYMENT SERVICE
      const result = await paymentService.initiateCollection(mandateId, {
        amount: amountNum,
        narration: `Payment to ${recipientName}`,
      });

      console.log("Payment result:", result);

      if (result.success) {
        // Payment successful
        setSuccess(true);
        setError("");
        
        // Show success message
        alert(`Payment of NGN ${formatAmount(amount)} to ${recipientName} successful!`);
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          router.push(`/success?txn_id=${transactionId}&user_id=${user_id}`);
        }, 2000);
      } else {
        // Payment failed
        const errorMsg = result.error || result.detail || "Payment failed. Please try again.";
        setError(errorMsg);
        console.error("Payment failed:", result);
      }
    } catch (err) {
      console.error("Payment error:", err);
      
      // Handle specific error types
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Network error. Please check your connection.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate payment for testing (only in development)
  const handleSimulatePayment = () => {
    const amountNum = parseFloat(amount);
    const pinCode = pin.join("");
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (pinCode.length !== 4) {
      setError("Please enter a complete 4-digit PIN");
      return;
    }

    setError("");
    setIsProcessing(true);

    // Simulate API call delay
    setTimeout(() => {
      console.log("=== Payment Details (SIMULATION) ===");
      console.log(`Transaction ID: ${transactionId}`);
      console.log(`Amount: NGN ${formatAmount(amount)}`);
      console.log(`Recipient: ${recipientName}`);
      console.log(`Account: ${accountNumber}`);
      console.log(`PIN: ${pinCode}`);
      console.log(`User ID: ${user_id}`);
      console.log(`Recipient ID: ${recipientId}`);
      console.log("====================================");

      alert(`✅ Payment Successful!\n\nNGN ${formatAmount(amount)} sent to ${recipientName}\nTransaction ID: ${transactionId}`);
      
      setIsProcessing(false);
      setSuccess(true);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push(`/dashboard?user_id=${user_id}`);
      }, 2000);
    }, 2000);
  };

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">
        <div className="flex items-center gap-1 mt-5">
          <Link href={`/Proxima?user_id=${user_id}`}>
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>

          <div className="bg-primary-100 w-50 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            Confirm Transaction
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="paymodal rounded-md bg-white px-5 py-1 max-w-md w-full">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-xs mb-4">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-xs mb-4">
                Payment successful! Redirecting...
              </div>
            )}

            {/* Recipient and Amount */}
            <div className="flex items-start justify-between gap-10 mt-5">
              <div>
                <p className="font-jetbrains text-xs text-neutral-500">RECIPIENT</p>
                <p className="font-bold text-sm">{recipientName}</p>
                <p className="text-neutral-700 text-xs">
                  Acc: {accountNumber}
                </p>
                {recipientId && (
                  <p className="text-neutral-500 text-xs mt-1">
                    ID: {recipientId}
                  </p>
                )}
              </div>

              <div>
                <p className="font-jetbrains text-xs text-neutral-500">Amount</p>
                <div className="flex items-center gap-1">
                  <span className="text-primary-500 font-bold text-xs">NGN</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    disabled={isProcessing || success}
                    className="text-primary-500 font-bold w-20 border-b border-primary-200 focus:outline-none focus:border-primary-500 bg-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="flex items-start justify-between gap-5 mt-5">
              <div>
                <p className="font-jetbrains text-xs text-neutral-500">
                  DATE/TIME
                </p>
                <p className="text-xs text-neutral-800">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-neutral-800">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Tx Type</p>
                <p className="text-xs text-neutral-800">Internal Transfer</p>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="bg-secondary-100 p-2 rounded-sm mt-5">
              <div className="flex items-center gap-10 justify-between">
                <p className="text-xs text-neutral-900 font-mono">
                  TXN_ID: {transactionId}
                </p>
                <LockKeyhole size={10} className="text-neutral-900" />
              </div>
              <p className="text-xs text-neutral-900 mt-1 font-mono">
                AES-256-GCM_ENCRYPTED_VOICE_VERIFIED_PROTOCOL_v4.2
              </p>
            </div>

            {/* PIN Input */}
            <p className="mt-5 text-xs font-jetbrains text-center text-neutral-600">
              ENTER YOUR PIN TO CONFIRM
            </p>

            <div className="flex justify-center gap-3 mt-3">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isProcessing || success}
                  className="w-10 h-12 text-center text-xl font-bold border-2 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50 rounded"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-5 mb-5">
              <button
                onClick={handleConfirm}
                disabled={isProcessing || success}
                className={`btn-dark text-xs flex items-center justify-center gap-1 font-bold ${
                  isProcessing || success ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⟳</span> Processing...
                  </>
                ) : success ? (
                  "✅ Payment Complete"
                ) : (
                  <>
                    Confirm & Pay <LockKeyhole size={10} />
                  </>
                )}
              </button>

              {/* Show simulate button only in development */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing || success}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-jetbrains transition-all disabled:opacity-50"
                >
                  🧪 Simulate Payment (Dev)
                </button>
              )}

              <Link
                className="text-xs btn-outlined text-center"
                href={`/Proxima?user_id=${user_id}`}
              >
                Cancel
              </Link>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500 font-mono">
                <p className="font-bold mb-1">Debug Info:</p>
                <p>User ID: {user_id}</p>
                <p>Recipient ID: {recipientId}</p>
                <p>Mandate ID: {mandateId || "❌ Missing"}</p>
                <p>Amount: {amount || "0.00"}</p>
                <p>PIN: {pin.join("") || "____"}</p>
                <p>Account: {accountNumber}</p>
                <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
                <p>Token: {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}