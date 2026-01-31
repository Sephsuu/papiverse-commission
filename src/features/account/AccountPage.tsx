"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1Icon, Eye, EyeOff, Pencil, Save } from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { handleChange, handleChangeSolo } from "@/lib/form-handle";
import FieldSkeleton from "@/components/custom/FieldSkeleton";

import type { User } from "@/types/user";
import { userInit } from "@/types/user";
import { format } from "date-fns";
import { NEXT_URL } from "@/lib/urls";

const genders = ["Male", "Female", "Gay", "Lesbian", "Others"];

/* -----------------------------------------------------------
 * MAIN PAGE
 * ----------------------------------------------------------- */
export function AccountPage() {
  const router = useRouter();
  const { claims, loading: authLoading } = useAuth();

  const [user, setUser] = useState<User>(userInit);
  const [editData, setEditData] = useState<User>(userInit);
  const [credentials, setCredentials] = useState<User>(userInit);

  const [date, setDate] = useState<Date | undefined>();

  const [openEdit, setOpenEdit] = useState(false);
  const [openCreds, setOpenCreds] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [refresh, setRefresh] = useState(false);

  /* ------------------------ FETCH USER ------------------------ */
  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      try {
        const cookie = await AuthService.getCookie();
        if (!cookie?.userId) return;

        const data = await UserService.getUserById(cookie.userId);
        if (data) {
          setUser(data);
          setEditData(data);
          setCredentials({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
          });
          if (data.dateOfBirth) setDate(new Date(data.dateOfBirth));
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [authLoading, refresh]);

  /* -------------------- Upload Profile Picture -------------------- */
  const uploadImage = async (file: File) => {
    try {
      const res = await UserService.fileUpload(file, claims.userId);
      if (res) toast.success("Profile picture updated!");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setRefresh(!refresh);
    }
  };

  /* -------------------- Update Profile -------------------- */
  const submitProfile = async () => {
    try {
      const payload = {
        ...editData,
        dateOfBirth: date?.toLocaleDateString("en-CA")
      };

      const res = await UserService.updateUser(payload);
      if (res) {
        toast.success("Profile updated!");
        setOpenEdit(false);
        setRefresh(!refresh);
      }
    } catch (e) {
      toast.error(String(e));
    } 
  };

  /* -------------------- Update Credentials -------------------- */
  const submitCredentials = async () => {
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        id: credentials.id,
        username: credentials.username,
        email: credentials.email,
        password: newPass,
        oldPassword: oldPass
      };

      const res = await AuthService.updateCredentials(payload);
      if (res) {
        toast.success("Credentials updated. Please login again.");
        await AuthService.deleteCookie();
        setTimeout(() => router.push("/auth"), 1500);
      }
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <SidebarProvider>
      <div className="w-full p-3 sm:p-5">

        {/* HEADER */}
        <div className="mb-4 pl-1 sm:pl-3">
          <h3 className="text-amber-500 text-xl sm:text-2xl font-bold">
            My Account
          </h3>
          <Separator />
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white border p-5 sm:p-7 rounded-3xl shadow-inner flex flex-col sm:flex-row sm:gap-5 gap-3 m-2 sm:m-5">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto sm:mx-0">
            <Avatar className="w-full h-full bg-amber-400 rounded-full">
              <AvatarImage
                src={`${NEXT_URL}/${user?.imageUrl}` || ""}
                className="object-cover rounded-full"
              />
            </Avatar>

            <label className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
              />
              <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </label>
          </div>

          <div className="p-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl text-amber-500 font-semibold">
              <FieldSkeleton text={!authLoading ? user.firstName : ""} width="w-40" />
            </h1>

            <h2 className="text-base sm:text-lg text-gray-500">
              <FieldSkeleton text={!authLoading ? user.position : ""} width="w-40" />
            </h2>

            <h2 className="text-base sm:text-lg text-gray-500">
              <FieldSkeleton text={!authLoading ? user.branch?.name : ""} width="w-40" />
            </h2>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="bg-white border p-5 sm:p-7 rounded-3xl shadow-inner m-2 sm:m-5">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl text-amber-500 font-semibold">Personal Information</h1>

            <Button size="sm" className="text-sm sm:text-base" onClick={() => setOpenEdit(true)}>
              Edit <Pencil className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <Info label="First Name" value={user.firstName} loading={authLoading} />
            <Info label="Last Name" value={user.lastName} loading={authLoading} />
            <Info label="Middle Name" value={user.middleName} loading={authLoading} />
            <Info label="Phone" value={user.contactNumber} loading={authLoading} />
            <Info label="Birthdate" value={user.dateOfBirth} loading={authLoading} />
            <Info label="Gender" value={user.gender} loading={authLoading} />
          </div>
        </div>

        {/* BRANCH + ACCOUNT */}
        <div className="flex flex-col lg:flex-row gap-4 m-2 sm:m-5">
          <BranchInfo user={user} authLoading={authLoading} />

          <AccountInfo
            credentials={credentials}
            setCredentials={setCredentials}
            openCreds={openCreds}
            setOpenCreds={setOpenCreds}
            showPass={showPass}
            setShowPass={setShowPass}
            oldPass={oldPass}
            newPass={newPass}
            confirmPass={confirmPass}
            setOldPass={setOldPass}
            setNewPass={setNewPass}
            setConfirmPass={setConfirmPass}
            confirmOpen={confirmOpen}
            setConfirmOpen={setConfirmOpen}
            submitCredentials={submitCredentials}
          />
        </div>

        {/* EDIT INFO */}
        <EditProfileDialog
          open={openEdit}
          setOpen={setOpenEdit}
          editData={editData}
          setEditData={setEditData}
          date={date}
          setDate={setDate}
          submitProfile={submitProfile}
        />
      </div>
    </SidebarProvider>
  );
}

/* -----------------------------------------------------------
 * SMALL COMPONENTS
 * ----------------------------------------------------------- */

interface InfoProps {
  label: string;
  value?: string | number | null;
  loading?: boolean;
}

function Info({ label, value, loading }: InfoProps) {
  return (
    <div>
      <h2 className="text-gray-500 text-sm sm:text-base">{label}</h2>
      <FieldSkeleton text={!loading ? String(value ?? "") : ""} width="w-32 sm:w-40" />
    </div>
  );
}

interface BranchInfoProps {
  user: User;
  authLoading: boolean;
}

function BranchInfo({ user, authLoading }: BranchInfoProps) {
  return (
    <div className="bg-white border p-5 sm:p-7 rounded-3xl shadow-inner flex-1">
      <h1 className="text-lg sm:text-xl text-amber-500 font-semibold">Branch Information</h1>
      <Separator className="my-3 sm:my-4" />

      <div className="grid grid-cols-1 gap-4">
        <Info label="Branch" value={user.branch?.name} loading={authLoading} />
        <Info
          label="Address"
          value={[
            user.branch?.streetAddress,
            user.branch?.barangay,
            user.branch?.city,
            user.branch?.province
          ]
            .filter(Boolean)
            .join(", ")}
          loading={authLoading}
        />
        <Info label="Internal Branch" value={user.branch?.isInternal ? "Yes" : "No"} loading={authLoading} />
        <Info label="Status" value={user.branch?.status} loading={authLoading} />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
 * ACCOUNT INFO (credentials update)
 * ----------------------------------------------------------- */

interface AccountInfoProps {
  credentials: User;
  setCredentials: React.Dispatch<React.SetStateAction<User>>;
  openCreds: boolean;
  setOpenCreds: React.Dispatch<React.SetStateAction<boolean>>;
  showPass: boolean;
  setShowPass: React.Dispatch<React.SetStateAction<boolean>>;
  oldPass: string;
  newPass: string;
  confirmPass: string;
  setOldPass: (v: string) => void;
  setNewPass: (v: string) => void;
  setConfirmPass: (v: string) => void;
  confirmOpen: boolean;
  setConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitCredentials: () => Promise<void>;
}

function AccountInfo(props: AccountInfoProps) {
  const {
    credentials,
    setCredentials,
    openCreds,
    setOpenCreds,
    showPass,
    setShowPass,
    oldPass,
    newPass,
    confirmPass,
    setOldPass,
    setNewPass,
    setConfirmPass,
    confirmOpen,
    setConfirmOpen,
    submitCredentials
  } = props;

  return (
    <div className="bg-white border p-5 sm:p-7 rounded-3xl shadow-inner flex-1">
      <div className="flex justify-between">
        <h1 className="text-lg sm:text-xl text-amber-500 font-semibold">Account Information</h1>

        <Button size="sm" onClick={() => setOpenCreds(true)}>
          Update <Pencil className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Separator className="my-3 sm:my-4" />

      <div className="space-y-3">
        <Info label="Username" value={credentials.username} />
        <Info label="Role" value={credentials.role} />
        <Info label="Email" value={credentials.email} />
      </div>

      <Dialog open={openCreds} onOpenChange={setOpenCreds}>
        <DialogContent className="max-w-[90%] sm:max-w-lg max-h-10/11 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account Credentials</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <InputField
              label="Username"
              name="username"
              value={credentials.username}
              onChange={(e) => handleChange(e, setCredentials)}
            />

            <InputField
              label="Email"
              name="email"
              value={credentials.email}
              onChange={(e) => handleChange(e, setCredentials)}
            />

            <InputField
              label="Old Password"
              name="oldPassword"
              type="password"
              value={oldPass}
              onChange={(e) => handleChangeSolo(e, setOldPass)}
            />

            <InputField
              label="New Password"
              name="newPassword"
              type="password"
              value={newPass}
              onChange={(e) => handleChangeSolo(e, setNewPass)}
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPass}
              onChange={(e) => handleChangeSolo(e, setConfirmPass)}
            />

            <Button className="w-full" onClick={() => setConfirmOpen(true)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
          </DialogHeader>

          <p className="text-sm">This will require re-login.</p>

          <div className="flex justify-between text-sm mt-3">
            <span>New Password:</span>

            <span className="flex gap-2">
              <input
                value={newPass}
                readOnly
                type={showPass ? "text" : "password"}
                className="bg-transparent w-28"
              />
              <button onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <Button variant="destructive" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCredentials}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -----------------------------------------------------------
 * INPUT FIELD COMPONENT
 * ----------------------------------------------------------- */
interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

function InputField({ label, name, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        name={name}
        {...props}
        className="border p-2 rounded w-full my-1 sm:my-2"
      />
    </div>
  );
}

/* -----------------------------------------------------------
 * EDIT PROFILE DIALOG
 * ----------------------------------------------------------- */

interface EditProfileDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editData: User;
  setEditData: React.Dispatch<React.SetStateAction<User>>;
  date?: Date;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  submitProfile: () => Promise<void>;
}

function EditProfileDialog({
  open,
  setOpen,
  editData,
  setEditData,
  date,
  setDate,
  submitProfile
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-10/11 overflow-y-auto max-w-[90%] sm:max-w-lg pt-0!">
        <DialogHeader className="sticky top-0 bg-white py-5">
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <InputField
            label="First Name"
            name="firstName"
            value={editData.firstName}
            onChange={(e) => handleChange(e, setEditData)}
          />

          <InputField
            label="Middle Name"
            name="middleName"
            value={editData.middleName}
            onChange={(e) => handleChange(e, setEditData)}
          />

          <InputField
            label="Last Name"
            name="lastName"
            value={editData.lastName}
            onChange={(e) => handleChange(e, setEditData)}
          />

          <InputField
            label="Phone"
            name="contactNumber"
            value={editData.contactNumber}
            onChange={(e) => handleChange(e, setEditData)}
          />

          {/* GENDER */}
          <label className="text-sm">Gender</label>
          <Select
            value={editData.gender}
            onValueChange={(v) => setEditData({ ...editData, gender: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g, i) => (
                <SelectItem key={i} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* BIRTHDATE */}
          <div>
            <label className="text-sm">Birthdate</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar1Icon className="mr-2" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          <Button className="w-full mt-1 sm:mt-3" onClick={submitProfile}>
            <Save className="mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
