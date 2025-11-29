"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { RiLoader4Line, RiUserLine, RiKey2Line, RiCheckLine, RiErrorWarningLine } from "@remixicon/react"
// import { toast } from "react-toastify" // Removed react-toastify import

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  // New state for custom alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Effect to hide the alert automatically
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAlert) {
      timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 5000); // Hide after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [showAlert]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setShowAlert(false); // Hide previous alert
    setAlertMessage("");
    setIsUpdatingPassword(true)

    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru harus minimal 8 karakter.")
      setAlertMessage("Kata sandi baru harus minimal 8 karakter.");
      setAlertType('error');
      setShowAlert(true);
      setIsUpdatingPassword(false)
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.")
      setAlertMessage("Konfirmasi kata sandi baru tidak cocok.");
      setAlertType('error');
      setShowAlert(true);
      setIsUpdatingPassword(false)
      return
    }

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setAlertMessage("Kata sandi berhasil diperbarui!");
        setAlertType('success');
        setShowAlert(true);
        // toast.success("Kata sandi berhasil diperbarui!") // Removed toast
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        const msg = result.message || "Gagal memperbarui kata sandi.";
        setPasswordError(msg);
        setAlertMessage(msg);
        setAlertType('error');
        setShowAlert(true);
        // toast.error(msg) // Removed toast
      }
    } catch (err) {
      console.error("Error changing password:", err)
      const msg = "Terjadi kesalahan saat mengubah kata sandi.";
      setPasswordError(msg);
      setAlertMessage(msg);
      setAlertType('error');
      setShowAlert(true);
      // toast.error(msg) // Removed toast
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <RiLoader4Line className="animate-spin h-10 w-10 text-gray-500" />
          <span className="ml-3 text-gray-700">Memuat Profil...</span>
        </div>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <RiUserLine className="w-6 h-6 mr-2 text-primary-red" /> Informasi Akun
              </h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Nama Lengkap:</strong> {user?.full_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                {user?.phone && <p><strong>Telepon:</strong> {user.phone}</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <RiKey2Line className="w-6 h-6 mr-2 text-primary-red" /> Ubah Kata Sandi
              </h2>

              {/* Custom Alert */} 
              {showAlert && ( 
                <div 
                  className={`p-4 mb-4 rounded-md flex items-center gap-3 
                    ${alertType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  role="alert"
                >
                  {alertType === 'success' ? 
                    <RiCheckLine className="w-5 h-5" /> : 
                    <RiErrorWarningLine className="w-5 h-5" />
                  }
                  <p className="text-sm font-medium">{alertMessage}</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  />
                </div>

                {passwordError && (
                  <p className="text-red-600 text-sm">{passwordError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <RiLoader4Line className="animate-spin inline-block mr-2" />
                  ) : (
                    "Ubah Kata Sandi"
                  )}
                </button>
              </form>
            </div>
          </main>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
