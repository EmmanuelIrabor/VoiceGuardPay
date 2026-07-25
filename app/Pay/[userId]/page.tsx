"use client";
import NavBar from "@/components/NavBar";
import { LockKeyhole, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CirclesThreePlus } from "phosphor-react";

function generateAccountNumber(): string {
  
  const first = Math.floor(Math.random() * 9) + 1;
  const rest = Math.floor(Math.random() * 1_00000000)
    .toString()
    .padStart(8, "0");
  return `${first}${rest}`;
}

export default function Pay() {
  const { user_id } = useParams<{ user_id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") ?? "Unknown";

 
  const [accountNumber] = useState(generateAccountNumber);

  const [pin, setPin] = useState(["", "", "", ""]);
  const [amount, setAmount] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(0, 1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleAmountChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split("");
      setPin(newPin);
      inputRefs.current[3]?.focus();
    }
  };

  const handleConfirm = () => {
    const pinCode = pin.join("");
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (pinCode.length === 4) {
      // alert(`Paying NGN ${amount} to ${recipientName} (Acc: ${accountNumber}) — PIN: ${pinCode}`);
      alert(`Transaction successful! , sent NGN ${amount} to ${recipientName} (Acc: ${accountNumber})`);
    } else {
      alert("Please enter a complete 4-digit PIN");
    }
  };

  async function handleTransfer() {
    const res = await fetch("https://prod-securepay-api.getsecurepay.ai/api/DirectDebit/fund-transfer'", {
      method: "POST",
      headers: {
        "Accept": "text/plain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        'sourceInstitutionCode': '000015',
        'amount': '1000',
        'beneficiaryAccountName': 'Mohammed Babatunde',
        'beneficiaryAccountNumber': '8054493740',
        'beneficiaryBankVerificationNumber': '22697143747',
        'beneficiaryKYCLevel': 0,
        'channelCode': 0,
        'originatorAccountName': 'Erunmwunse Emmanuel Irabor',
        'originatorAccountNumber': '2283178793',
        'originatorBankVerificationNumber': '22552018428',
        'originatorKYCLevel': 0,
        'destinationInstitutionCode': '100004',
        'mandateReferenceNumber': 'mandateReferenceNumber',
        'nameEnquiryRef': 'nameEnquiryRef',
        'originatorNarration': 'originatorNarration',
        'paymentReference': 'paymentReference',
        'transactionId': 'transactionId',
        'transactionLocation': 'transactionLocation',
        'beneficiaryNarration': 'trf',
        'billerId': '4024031',
        'initiatorAccountNumber': 'initiatorAccountNumber',
        'initiatorAccountName': 'initiatorAccountName',
      }),
    });

    const text = await res.text();
  }

  

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">

        <div className="flex items-center gap-1 mt-5">
          <Link href="../Proxima/">
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>

          <div className="bg-primary-100 w-50 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            Confirm Transaction
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center">
          <div className="paymodal rounded-md bg-white px-5 py-1">

            <div className="flex items-start justify-between gap-10 mt-5">
              <div>
                <p className="font-jetbrains text-xs">RECEPIENT</p>
                <p className="font-bold text-xs">{recipientName}</p>
                <p className="text-neutral-700 text-xs">
                  Acc: {accountNumber}
                </p>
              </div>

              <div>
                <p className="font-jetbrains text-xs">Amount</p>
                <div className="flex items-center gap-1">
                  <span className="text-primary-500 font-bold text-xs">NGN</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="text-primary-500 font-bold w-20 border-b border-primary-200 focus:outline-none focus:border-primary-500 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-5 mt-5">
              <div>
                <p className="font-jetbrains text-xs text-neutral-800">
                  DATE/TIME
                </p>
                <p className="text-xs text-neutral-800">Oct 24 2026 </p>
                <p className="text-xs text-neutral-800">14:29 Pm</p>
              </div>
              <div>
                <p className="text-xs text-neutral-800">Tx Type</p>
                <p className="text-xs text-neutral-800">Internal Transfer</p>
              </div>
            </div>

            <div className="bg-secondary-100 p-2 rounded-sm mt-5">
              <div className="flex items-center gap-10 justify-between">
                <p className="text-xs text-neutral-900">
                  TXN_ID: VG-8839-XP92-00
                </p>
                <LockKeyhole size={10} className="text-neutral-900" />
              </div>
              <p className="text-xs text-neutral-900 mt-1">
                AES-256-GCM_ENCRYPTED_VOICE_VERIFIED_PROTOCOL_v4.2
              </p>
            </div>

            <p className="mt-5 text-xs font-jetbrains text-center">
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
                  className="w-10 h-12 text-center text-xl font-bold border-2 border-neutral-900  focus:border-primary-500 focus:ring-primary-200 transition-all"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-5 mb-5">
              <button
                onClick={handleConfirm}
                className="btn-dark text-xs flex items-center justify-center gap-1 font-bold"
              >
                Confirm & Pay <LockKeyhole size={10} />
              </button>

              <Link
                className="text-xs btn-outlined text-center"
                href={"/Proxima"}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}