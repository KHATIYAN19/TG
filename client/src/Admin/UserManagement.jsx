import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  Eye,
  Filter,
  Handshake,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* ============================================================
   CONFIGURATION
============================================================ */

const API_BASE = String(BASE_URL).replace(/\/$/, "");

const USERS_API = `${API_BASE}/api/admin/users`;

// Update this only if your signup page uses a different route.
const CREATE_USER_ROUTE = "/admin/signup";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "Employee", label: "Employee" },
  { value: "normal", label: "Normal User" },
  { value: "affiliate", label: "Affiliate Partner" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
];

const COMMISSION_TYPES = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed amount" },
];

const PAGE_SIZE = 10;

/* ============================================================
   HELPERS
============================================================ */

const getErrorMessage = (error, fallback) => {
  if (error?.response?.status === 429) {
    return "Too many requests. Please try again later.";
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const getRoleLabel = (role) =>
  ROLES.find((item) => item.value === role)?.label ||
  role ||
  "Unknown";

const formatDate = (value, withTime = false) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      : {}),
  });
};

const formatMoney = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
};

const formatCommission = (affiliate) => {
  if (!affiliate) return "—";

  if (affiliate.commissionType === "percentage") {
    return `${affiliate.commissionValue}%`;
  }

  if (affiliate.commissionType === "fixed") {
    return formatMoney(affiliate.commissionValue);
  }

  return "—";
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const isValidMobile = (value) =>
  /^[6-9]\d{9}$/.test(value);

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const AFFILIATE_CODE_REGEX = /^[A-Z0-9_-]{3,30}$/;

const isSelf = (user, currentUserId) =>
  Boolean(
    user &&
      currentUserId &&
      String(user._id) === String(currentUserId)
  );

/* ============================================================
   THEME SYNCHRONIZATION
============================================================ */

const getTheme = () => {
  if (typeof window === "undefined") return "light";

  const value = localStorage.getItem("theme");

  if (value === "dark" || value === "light") {
    return value;
  }

  return document.documentElement.classList.contains(
    "dark"
  )
    ? "dark"
    : "light";
};

const useSyncedTheme = () => {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const sync = () => setTheme(getTheme());

    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener("storage", sync);
    window.addEventListener("theme-change", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
      window.removeEventListener("theme-change", sync);
    };
  }, []);

  return theme;
};

/* ============================================================
   SHARED UI
============================================================ */

const Badge = ({ value, type = "status", dark }) => {
  const normalized = String(value || "").toLowerCase();

  const orange =
    normalized === "active" ||
    normalized === "affiliate";

  const gray =
    normalized === "inactive" ||
    normalized === "normal";

  const dangerous =
    normalized === "blocked" ||
    normalized === "suspended";

  let colors;

  if (orange) {
    colors = dark
      ? "border-[#764523] bg-[#322215] text-[#FFA35C]"
      : "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]";
  } else if (dangerous) {
    colors = dark
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : "border-red-200 bg-red-50 text-red-600";
  } else if (gray) {
    colors = dark
      ? "border-[#444] bg-[#292929] text-[#BBBBBB]"
      : "border-[#E5E5E5] bg-[#F7F7F7] text-[#666]";
  } else {
    colors = dark
      ? "border-[#454545] bg-[#252525] text-[#D5D5D5]"
      : "border-[#E5E5E5] bg-[#F5F5F5] text-[#555]";
  }

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${colors}`}
    >
      {type === "status" && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            normalized === "active"
              ? "bg-[#F97316]"
              : dangerous
                ? "bg-red-500"
                : "bg-[#999]"
          }`}
        />
      )}

      {type === "role"
        ? getRoleLabel(value)
        : value || "Unknown"}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  dark,
  onClick,
  active,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 rounded-xl border p-4 text-left transition-all sm:p-5 ${
      active
        ? dark
          ? "border-[#B45B20] bg-[#241B15]"
          : "border-[#F97316] bg-[#FFF8F3]"
        : dark
          ? "border-[#303030] bg-[#151515] hover:border-[#555]"
          : "border-[#E8E8E8] bg-white hover:border-[#F5C197]"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          dark ? "bg-[#282828]" : "bg-[#FFF1E6]"
        }`}
      >
        <Icon size={18} className="text-[#F97316]" />
      </div>

      <ArrowRight
        size={14}
        className={dark ? "text-[#777]" : "text-[#AAA]"}
      />
    </div>

    <p className="mt-4 text-[24px] font-semibold tracking-tight">
      {value}
    </p>

    <p className="mt-1 text-[12px] font-semibold">{label}</p>

    <p
      className={`mt-1 text-[10px] ${
        dark ? "text-[#999]" : "text-[#777]"
      }`}
    >
      {description}
    </p>
  </button>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  type = "text",
  dark,
  maxLength,
}) => (
  <div className="min-w-0">
    <label
      htmlFor={name}
      className="mb-2 block text-[12px] font-semibold"
    >
      {label}
      {required && <span className="ml-1 text-[#F97316]">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      className={`h-11 w-full rounded-lg border px-3.5 text-[12px] outline-none transition-colors focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 disabled:opacity-50 ${
        dark
          ? "border-[#3C3C3C] bg-[#202020] text-white placeholder:text-[#777]"
          : "border-[#DEDEDE] bg-white text-[#171717] placeholder:text-[#999]"
      }`}
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  dark,
}) => (
  <div className="min-w-0">
    <label
      htmlFor={name}
      className="mb-2 block text-[12px] font-semibold"
    >
      {label}
    </label>

    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`h-11 w-full appearance-none rounded-lg border px-3.5 pr-10 text-[12px] outline-none focus:border-[#F97316] ${
          dark
            ? "border-[#3C3C3C] bg-[#202020] text-white"
            : "border-[#DEDEDE] bg-white text-[#171717]"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888]"
      />
    </div>
  </div>
);

const Detail = ({ label, value, dark, mono = false }) => (
  <div className="min-w-0">
    <p
      className={`text-[11px] ${
        dark ? "text-[#999]" : "text-[#777]"
      }`}
    >
      {label}
    </p>

    <p
      className={`mt-1.5 break-words text-[12px] font-semibold ${
        mono ? "font-mono" : ""
      }`}
    >
      {value === null || value === undefined || value === ""
        ? "Not provided"
        : value}
    </p>
  </div>
);

/* ============================================================
   MODAL WRAPPER
============================================================ */

const Modal = ({
  title,
  subtitle,
  children,
  onClose,
  dark,
  width = "max-w-[540px]",
  busy,
}) => {
  useEffect(() => {
    const keyHandler = (event) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    document.addEventListener("keydown", keyHandler);

    return () =>
      document.removeEventListener("keydown", keyHandler);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl ${width} ${
          dark
            ? "border-[#383838] bg-[#181818] text-white"
            : "border-[#E7E7E7] bg-white text-[#171717]"
        }`}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${
            dark ? "border-[#333]" : "border-[#EAEAEA]"
          }`}
        >
          <div>
            <h2 className="text-[18px] font-semibold">{title}</h2>

            {subtitle && (
              <p
                className={`mt-1 text-[12px] leading-5 ${
                  dark ? "text-[#999]" : "text-[#777]"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close"
            className={`rounded-lg p-1.5 ${
              dark
                ? "text-[#999] hover:bg-[#333]"
                : "text-[#888] hover:bg-[#F3F3F3]"
            }`}
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   USER EDIT FORM
============================================================ */

const UserEditForm = ({
  user,
  onSave,
  onCancel,
  saving,
  dark,
}) => {
  const [form, setForm] = useState(() => ({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    role: user.role || "normal",
    affiliate: {
      code: user.affiliate?.code || "",
      commissionType:
        user.affiliate?.commissionType || "percentage",
      commissionValue:
        user.affiliate?.commissionValue ?? 10,
      status: user.affiliate?.status || "active",
    },
  }));

  const update = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateAffiliate = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      affiliate: {
        ...prev.affiliate,
        [name]:
          name === "code"
            ? value.toUpperCase().replace(/\s/g, "")
            : value,
      },
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const mobile = form.mobile.trim();

    if (name.length < 2 || name.length > 100) {
      toast.error("Name must have 2–100 characters");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (form.role !== "admin" && !isValidMobile(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (mobile && !isValidMobile(mobile)) {
      toast.error("Invalid mobile number");
      return;
    }

    const body = {
      name,
      email,
      mobile: mobile || null,
      role: form.role,
    };

    if (form.role === "affiliate") {
      const code = form.affiliate.code.trim().toUpperCase();
      const commissionValue = Number(
        form.affiliate.commissionValue
      );

      if (!AFFILIATE_CODE_REGEX.test(code)) {
        toast.error(
          "Affiliate code must have 3–30 letters, digits, - or _"
        );
        return;
      }

      if (
        !Number.isFinite(commissionValue) ||
        commissionValue <= 0
      ) {
        toast.error("Commission must be greater than zero");
        return;
      }

      if (
        form.affiliate.commissionType === "percentage" &&
        commissionValue > 100
      ) {
        toast.error("Percentage cannot exceed 100%");
        return;
      }

      if (
        Math.abs(
          commissionValue * 100 -
            Math.round(commissionValue * 100)
        ) > 1e-7
      ) {
        toast.error("Maximum two commission decimal places");
        return;
      }

      body.affiliate = {
        code,
        commissionType: form.affiliate.commissionType,
        commissionValue,
        status: form.affiliate.status,
      };
    } else if (user.role === "affiliate") {
      // Explicitly clear config when changing away
      // from the affiliate role.
      body.affiliate = null;
    }

    onSave(body);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="name"
          label="Full name"
          value={form.name}
          onChange={update}
          required
          dark={dark}
          maxLength={100}
        />

        <Field
          name="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={update}
          required
          dark={dark}
        />

        <Field
          name="mobile"
          label="Mobile number"
          value={form.mobile}
          onChange={update}
          placeholder="10-digit number"
          dark={dark}
        />

        <SelectField
          name="role"
          label="Account role"
          value={form.role}
          options={ROLES}
          onChange={update}
          dark={dark}
        />
      </div>

      {form.role === "affiliate" && (
        <div
          className={`space-y-4 rounded-xl border p-4 ${
            dark
              ? "border-[#5A3923] bg-[#241B16]"
              : "border-[#F8D7BF] bg-[#FFF8F3]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Handshake
              size={18}
              className="text-[#F97316]"
            />

            <h3 className="text-[13px] font-semibold">
              Affiliate configuration
            </h3>
          </div>

          <Field
            name="code"
            label="Affiliate code"
            value={form.affiliate.code}
            onChange={updateAffiliate}
            placeholder="PARTNER25"
            required
            dark={dark}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              name="commissionType"
              label="Commission type"
              value={form.affiliate.commissionType}
              options={COMMISSION_TYPES}
              onChange={updateAffiliate}
              dark={dark}
            />

            <Field
              name="commissionValue"
              label={
                form.affiliate.commissionType === "percentage"
                  ? "Commission (%)"
                  : "Fixed commission (₹)"
              }
              type="number"
              value={form.affiliate.commissionValue}
              onChange={updateAffiliate}
              required
              dark={dark}
            />
          </div>

          <SelectField
            name="status"
            label="Affiliate status"
            value={form.affiliate.status}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            onChange={updateAffiliate}
            dark={dark}
          />

          <p
            className={`text-[11px] leading-5 ${
              dark ? "text-[#B7A89B]" : "text-[#8A6A55]"
            }`}
          >
            Affiliate status controls new referrals. Account
            status separately controls whether this user can log in.
          </p>
        </div>
      )}

      <div
        className={`rounded-lg border p-3 text-[11px] leading-6 ${
          dark
            ? "border-[#383838] bg-[#202020] text-[#AAA]"
            : "border-[#E8E8E8] bg-[#F8F8F8] text-[#777]"
        }`}
      >
        Changing a user's email or role will revoke existing
        sessions. Other profile changes are saved directly.
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`h-11 flex-1 rounded-lg border text-[12px] font-semibold ${
            dark
              ? "border-[#444] hover:bg-[#292929]"
              : "border-[#DDD] hover:bg-[#F7F7F7]"
          }`}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[12px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Save changes
        </button>
      </div>
    </form>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const UserManagement = () => {
  const navigate = useNavigate();

  const token = useSelector(
    (state) => state.auth?.token
  );

  const authUser = useSelector(
    (state) => state.auth?.user
  );

  const theme = useSyncedTheme();
  const dark = theme === "dark";

  const currentUserId =
    authUser?._id ||
    authUser?.userId ||
    authUser?.id ||
    null;

  /* ----------------------------------------------------------
     LIST STATE
  ---------------------------------------------------------- */

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [affiliateStatusFilter, setAffiliateStatusFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    pages: 1,
  });

  /* ----------------------------------------------------------
     MODALS AND MUTATIONS
  ---------------------------------------------------------- */

  const [selectedUser, setSelectedUser] = useState(null);

  const [modal, setModal] = useState(null);
  // { type, user, nextStatus?, message? }

  const [busy, setBusy] = useState(false);

  const [statusReason, setStatusReason] = useState("");

  const [detailLoading, setDetailLoading] = useState(false);

  /* ----------------------------------------------------------
     API CONFIG
  ---------------------------------------------------------- */

  const apiConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      timeout: 20000,
    }),
    [token]
  );

  /* ----------------------------------------------------------
     LOAD USERS

     GET /api/admin/users
  ---------------------------------------------------------- */

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("You need to sign in as an administrator.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (affiliateStatusFilter) {
        params.affiliateStatus = affiliateStatusFilter;
      }

      const { data } = await axios.get(
        USERS_API,
        {
          ...apiConfig,
          params,
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to fetch users"
        );
      }

      setUsers(Array.isArray(data.users) ? data.users : []);

      setPagination({
        total: Number(data.pagination?.total || 0),
        page: Number(data.pagination?.page || page),
        limit: Number(data.pagination?.limit || PAGE_SIZE),
        pages: Math.max(
          1,
          Number(data.pagination?.pages || 1)
        ),
      });
    } catch (err) {
      setUsers([]);

      setError(
        getErrorMessage(err, "Unable to load users.")
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    apiConfig,
    page,
    search,
    roleFilter,
    statusFilter,
    affiliateStatusFilter,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ----------------------------------------------------------
     SEARCH DEBOUNCE
  ---------------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ----------------------------------------------------------
     OPEN USER DETAILS

     GET /api/admin/users/:userId
  ---------------------------------------------------------- */

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setModal({ type: "view", user });
    setDetailLoading(true);

    try {
      const { data } = await axios.get(
        `${USERS_API}/${user._id}`,
        apiConfig
      );

      if (data.success && data.user) {
        setSelectedUser(data.user);
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to load full user details."
        )
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* ----------------------------------------------------------
     OPEN EDIT MODAL

     GET /api/admin/users/:userId
  ---------------------------------------------------------- */

  const openEdit = async (user) => {
    setSelectedUser(user);
    setModal({ type: "edit", user });
    setDetailLoading(true);

    try {
      const { data } = await axios.get(
        `${USERS_API}/${user._id}`,
        apiConfig
      );

      if (data.success && data.user) {
        setSelectedUser(data.user);
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to fetch updated user details."
        )
      );

      setModal(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ----------------------------------------------------------
     EDIT USER

     PATCH /api/admin/users/:userId
  ---------------------------------------------------------- */

  const saveUser = async (body) => {
    if (!selectedUser || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${USERS_API}/${selectedUser._id}`,
        body,
        apiConfig
      );

      if (!data.success) {
        throw new Error(data.message || "Update failed");
      }

      toast.success(data.message || "User updated");

      setModal(null);
      setSelectedUser(null);

      await fetchUsers();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Unable to update user.")
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     UPDATE ACCOUNT STATUS

     PATCH /api/admin/users/:userId/status
  ---------------------------------------------------------- */

  const updateStatus = async () => {
    if (!modal?.user || busy) return;

    const user = modal.user;
    const status = modal.nextStatus;

    if (!status) return;

    if (isSelf(user, currentUserId)) {
      toast.error("You cannot change your own status.");
      return;
    }

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${USERS_API}/${user._id}/status`,
        {
          status,
          reason: statusReason.trim() || undefined,
        },
        apiConfig
      );

      if (!data.success) {
        throw new Error(data.message || "Status update failed");
      }

      toast.success(data.message || "Status updated");

      setModal(null);
      setStatusReason("");

      await fetchUsers();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Unable to change status.")
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     CHANGE AFFILIATE REFERRAL STATUS

     PATCH /api/admin/users/:userId/affiliate/status
  ---------------------------------------------------------- */

  const updateAffiliateStatus = async () => {
    if (!modal?.user || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${USERS_API}/${modal.user._id}/affiliate/status`,
        {
          status: modal.nextStatus,
        },
        apiConfig
      );

      if (!data.success) {
        throw new Error(
          data.message || "Affiliate update failed"
        );
      }

      toast.success(
        data.message || "Affiliate status updated"
      );

      setModal(null);
      await fetchUsers();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to update affiliate status."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     SEND PASSWORD INVITATION / RESET

     POST /api/admin/users/:userId/password-link
  ---------------------------------------------------------- */

  const sendPasswordLink = async () => {
    if (!modal?.user || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.post(
        `${USERS_API}/${modal.user._id}/password-link`,
        {},
        apiConfig
      );

      if (!data.success) {
        throw new Error(
          data.message || "Unable to send password link."
        );
      }

      toast.success(
        data.message || "Password link sent by email."
      );

      setModal(null);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to send password link."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     LOG OUT ALL USER DEVICES

     POST /api/admin/users/:userId/logout-all
  ---------------------------------------------------------- */

  const revokeAllSessions = async () => {
    if (!modal?.user || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.post(
        `${USERS_API}/${modal.user._id}/logout-all`,
        {},
        apiConfig
      );

      if (!data.success) {
        throw new Error(data.message || "Logout failed");
      }

      toast.success(
        "All sessions have been revoked."
      );

      setModal(null);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to revoke sessions."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     SOFT DELETE USER

     DELETE /api/admin/users/:userId
  ---------------------------------------------------------- */

  const deleteUser = async () => {
    if (!modal?.user || busy) return;

    if (isSelf(modal.user, currentUserId)) {
      toast.error("You cannot delete your own account.");
      return;
    }

    setBusy(true);

    try {
      const { data } = await axios.delete(
        `${USERS_API}/${modal.user._id}`,
        apiConfig
      );

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      toast.success(
        data.message || "User deleted successfully."
      );

      setModal(null);

      if (users.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to delete user."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------------
     FILTER HELPERS
  ---------------------------------------------------------- */

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setAffiliateStatusFilter("");
    setPage(1);
  };

  const changeRoleFilter = (value) => {
    setRoleFilter(value);
    setAffiliateStatusFilter("");
    setPage(1);
  };

  /* ----------------------------------------------------------
     STATISTICS

     These count only the current loaded page.
     They are deliberately not presented as total
     company-wide counts.
  ---------------------------------------------------------- */

  const pageStats = useMemo(
    () => ({
      displayed: users.length,
      active: users.filter(
        (user) => user.status === "active"
      ).length,
      affiliates: users.filter(
        (user) => user.role === "affiliate"
      ).length,
      restricted: users.filter(
        (user) =>
          ["blocked", "suspended", "inactive"].includes(
            user.status
          )
      ).length,
    }),
    [users]
  );

  /* ----------------------------------------------------------
     STYLES
  ---------------------------------------------------------- */

  const muted = dark
    ? "text-[#999999]"
    : "text-[#777777]";

  const card = dark
    ? "border-[#303030] bg-[#151515]"
    : "border-[#E7E7E7] bg-white";

  const border = dark
    ? "border-[#333333]"
    : "border-[#EAEAEA]";

  const subtle = dark
    ? "bg-[#202020]"
    : "bg-[#F8F8F8]";

  const outlineButton = dark
    ? "border-[#444444] hover:bg-[#292929]"
    : "border-[#DEDEDE] hover:bg-[#F6F6F6]";

  const actionButton = `inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition-colors disabled:opacity-50 ${outlineButton}`;

  /* ----------------------------------------------------------
     USER ACTION MENU

     Uses buttons instead of dropdown portals to keep
     mobile interactions reliable.
  ---------------------------------------------------------- */

  const UserActions = ({ user, compact = false }) => {
    const self = isSelf(user, currentUserId);

    const actionBase = compact
      ? "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold"
      : "flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-semibold";

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openUserDetails(user)}
          className={`${actionBase} ${outlineButton}`}
          title="View user"
        >
          <Eye size={14} />
          {!compact && "View"}
        </button>

        <button
          type="button"
          onClick={() => openEdit(user)}
          className={`${actionBase} ${outlineButton}`}
          title="Edit user"
        >
          <Edit3 size={14} />
          {!compact && "Edit"}
        </button>

        <button
          type="button"
          onClick={() =>
            setModal({
              type: "more",
              user,
            })
          }
          className={`${actionBase} ${outlineButton}`}
          title="More actions"
        >
          <MoreHorizontal size={17} />
          {!compact && "More"}
        </button>
      </div>
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      data-theme={theme}
      className={`mt-16 min-h-screen px-4 py-7 transition-colors duration-200 sm:px-6 lg:px-8 ${
        dark
          ? "bg-black text-white"
          : "bg-white text-[#171717]"
      }`}
    >
      <div className="mx-auto max-w-[1380px] space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] ${muted}`}
            >
              <span className="h-2 w-2 rounded-full bg-[#F97316]" />
              Target Trek / Administration
            </p>

            <h1 className="mt-3 text-[30px] font-semibold tracking-[-1px] sm:text-[36px]">
              User management
            </h1>

            <p className={`mt-2 text-[13px] leading-6 ${muted}`}>
              Manage team members, affiliates, account access
              and security from one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className={`${actionButton} h-10 px-4`}
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate(CREATE_USER_ROUTE)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#EA650A]"
            >
              <Plus size={17} />
              Add user
            </button>
          </div>
        </div>

        {/* ====================================================
            STAT CARDS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Displayed users"
            value={loading ? "…" : pageStats.displayed}
            description="On this page"
            dark={dark}
            onClick={resetFilters}
          />

          <StatCard
            icon={CheckCircle2}
            label="Active users"
            value={loading ? "…" : pageStats.active}
            description="Active on this page"
            dark={dark}
            active={statusFilter === "active"}
            onClick={() => {
              setStatusFilter(
                statusFilter === "active" ? "" : "active"
              );
              setPage(1);
            }}
          />

          <StatCard
            icon={Handshake}
            label="Affiliates"
            value={loading ? "…" : pageStats.affiliates}
            description="On this page"
            dark={dark}
            active={roleFilter === "affiliate"}
            onClick={() =>
              changeRoleFilter(
                roleFilter === "affiliate" ? "" : "affiliate"
              )
            }
          />

          <StatCard
            icon={Shield}
            label="Restricted users"
            value={loading ? "…" : pageStats.restricted}
            description="Inactive, suspended or blocked on this page"
            dark={dark}
            onClick={() => {
              setStatusFilter("blocked");
              setPage(1);
            }}
          />
        </div>

        {/* ====================================================
            SEARCH / FILTERS
        ==================================================== */}

        <div className={`rounded-xl border p-4 sm:p-5 ${card}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={17}
                className="text-[#F97316]"
              />

              <p className="text-[13px] font-semibold">
                Find and filter users
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(140px,1fr))]">
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search name, email, mobile, affiliate code..."
                  className={`h-11 w-full rounded-lg border pl-10 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
                    dark
                      ? "border-[#3B3B3B] bg-[#202020] text-white placeholder:text-[#777]"
                      : "border-[#E2E2E2] bg-white placeholder:text-[#999]"
                  }`}
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#999]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* ROLE */}

              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    changeRoleFilter(event.target.value)
                  }
                  className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
                    dark
                      ? "border-[#3B3B3B] bg-[#202020] text-white"
                      : "border-[#E2E2E2] bg-white"
                  }`}
                >
                  <option value="">All roles</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                />
              </div>

              {/* ACCOUNT STATUS */}

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
                    dark
                      ? "border-[#3B3B3B] bg-[#202020] text-white"
                      : "border-[#E2E2E2] bg-white"
                  }`}
                >
                  <option value="">All account statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                />
              </div>

              {/* AFFILIATE STATUS */}

              <div className="relative">
                <select
                  value={affiliateStatusFilter}
                  onChange={(event) => {
                    setAffiliateStatusFilter(event.target.value);

                    if (event.target.value) {
                      setRoleFilter("affiliate");
                    }

                    setPage(1);
                  }}
                  className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
                    dark
                      ? "border-[#3B3B3B] bg-[#202020] text-white"
                      : "border-[#E2E2E2] bg-white"
                  }`}
                >
                  <option value="">All referral statuses</option>
                  <option value="active">Referrals active</option>
                  <option value="inactive">Referrals inactive</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={`text-[11px] ${muted}`}>
                {loading
                  ? "Loading results..."
                  : `${pagination.total} matching account${
                      pagination.total === 1 ? "" : "s"
                    }`}
              </p>

              {(searchInput ||
                roleFilter ||
                statusFilter ||
                affiliateStatusFilter) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-[#F97316]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        {loading ? (
          <div
            className={`flex min-h-[340px] items-center justify-center rounded-xl border ${card}`}
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={27}
                className="animate-spin text-[#F97316]"
              />
              <p className={`text-[12px] ${muted}`}>
                Loading user accounts...
              </p>
            </div>
          </div>
        ) : error ? (
          <div
            className={`rounded-xl border p-8 text-center ${card}`}
          >
            <AlertCircle
              size={30}
              className="mx-auto text-[#F97316]"
            />

            <h2 className="mt-4 text-[18px] font-semibold">
              Unable to load users
            </h2>

            <p className={`mt-2 text-[12px] ${muted}`}>
              {error}
            </p>

            <button
              type="button"
              onClick={fetchUsers}
              className="mt-5 rounded-lg bg-[#F97316] px-5 py-2.5 text-[12px] font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div
            className={`rounded-xl border p-10 text-center ${card}`}
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${
                dark ? "bg-[#292929]" : "bg-[#FFF3E8]"
              }`}
            >
              <Users
                size={25}
                className="text-[#F97316]"
              />
            </div>

            <h2 className="mt-5 text-[17px] font-semibold">
              No users found
            </h2>

            <p
              className={`mx-auto mt-2 max-w-[400px] text-[12px] leading-6 ${muted}`}
            >
              Try adjusting your search or filters.
              You can also create a new account.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className={`${actionButton} h-10`}
              >
                Clear filters
              </button>

              <button
                type="button"
                onClick={() => navigate(CREATE_USER_ROUTE)}
                className="flex h-10 items-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white"
              >
                <Plus size={16} />
                Add user
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ====================================================
                DESKTOP TABLE
            ==================================================== */}

            <div
              className={`hidden overflow-hidden rounded-xl border lg:block ${card}`}
            >
              <div
                className={`flex items-center justify-between border-b px-5 py-4 ${border}`}
              >
                <div>
                  <h2 className="text-[14px] font-semibold">
                    User accounts
                  </h2>

                  <p className={`mt-1 text-[11px] ${muted}`}>
                    Select View or Edit to manage an account.
                  </p>
                </div>

                <span className={`text-[11px] ${muted}`}>
                  Page {page} of {pagination.pages}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead
                    className={
                      dark
                        ? "bg-[#1D1D1D] text-[#AAAAAA]"
                        : "bg-[#FAFAFA] text-[#777777]"
                    }
                  >
                    <tr className="text-[10px] uppercase tracking-[0.6px]">
                      <th className="px-5 py-4 font-semibold">
                        User
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Role
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Account status
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Affiliate
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Last login
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Created
                      </th>

                      <th className="px-4 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className={`border-t transition-colors ${
                          dark
                            ? "border-[#303030] hover:bg-[#202020]"
                            : "border-[#EEEEEE] hover:bg-[#FAFAFA]"
                        }`}
                      >
                        {/* USER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[12px] font-bold text-[#F97316]">
                              {initials(user.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[210px] truncate text-[12px] font-semibold">
                                {user.name}
                              </p>

                              <p className={`mt-1 max-w-[210px] truncate text-[11px] ${muted}`}>
                                {user.email}
                              </p>

                              {user.mobile && (
                                <p className={`mt-1 text-[10px] ${muted}`}>
                                  {user.mobile}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-4">
                          <Badge
                            value={user.role}
                            type="role"
                            dark={dark}
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <Badge
                            value={user.status}
                            dark={dark}
                          />
                        </td>

                        {/* AFFILIATE */}

                        <td className="px-4 py-4">
                          {user.role === "affiliate" &&
                          user.affiliate ? (
                            <div className="space-y-1.5">
                              <p className="font-mono text-[11px] font-semibold">
                                {user.affiliate.code}
                              </p>

                              <p className="text-[11px] font-semibold text-[#F97316]">
                                {formatCommission(user.affiliate)}
                              </p>

                              <Badge
                                value={user.affiliate.status}
                                dark={dark}
                              />
                            </div>
                          ) : (
                            <span className={`text-[11px] ${muted}`}>
                              —
                            </span>
                          )}
                        </td>

                        {/* LAST LOGIN */}

                        <td className={`px-4 py-4 text-[11px] ${muted}`}>
                          {formatDate(user.lastLoginAt, true)}
                        </td>

                        {/* CREATED */}

                        <td className={`px-4 py-4 text-[11px] ${muted}`}>
                          {formatDate(user.createdAt)}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <UserActions user={user} compact />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ====================================================
                MOBILE / TABLET CARDS
            ==================================================== */}

            <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
              {users.map((user) => (
                <article
                  key={user._id}
                  className={`min-w-0 rounded-xl border p-4 ${card}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[13px] font-bold text-[#F97316]">
                      {initials(user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[13px] font-semibold">
                        {user.name}
                      </h3>

                      <p className={`mt-1 break-all text-[11px] ${muted}`}>
                        {user.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge
                          value={user.role}
                          type="role"
                          dark={dark}
                        />

                        <Badge
                          value={user.status}
                          dark={dark}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`my-4 border-t ${border}`}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Detail
                      label="Mobile"
                      value={user.mobile}
                      dark={dark}
                    />

                    <Detail
                      label="Last login"
                      value={formatDate(user.lastLoginAt)}
                      dark={dark}
                    />

                    {user.role === "affiliate" && (
                      <>
                        <Detail
                          label="Affiliate code"
                          value={user.affiliate?.code}
                          dark={dark}
                          mono
                        />

                        <Detail
                          label="Commission"
                          value={formatCommission(user.affiliate)}
                          dark={dark}
                        />
                      </>
                    )}
                  </div>

                  <div
                    className={`mt-4 border-t pt-4 ${border}`}
                  >
                    <UserActions user={user} />
                  </div>
                </article>
              ))}
            </div>

            {/* ====================================================
                PAGINATION
            ==================================================== */}

            <div
              className={`flex flex-col gap-4 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${card}`}
            >
              <p className={`text-[11px] ${muted}`}>
                Showing{" "}
                <strong className={dark ? "text-white" : "text-black"}>
                  {(page - 1) * PAGE_SIZE + 1}
                  {"–"}
                  {Math.min(
                    page * PAGE_SIZE,
                    pagination.total
                  )}
                </strong>
                {" "}of{" "}
                <strong className={dark ? "text-white" : "text-black"}>
                  {pagination.total}
                </strong>
                {" "}users
              </p>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`${actionButton} disabled:cursor-not-allowed`}
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className={`px-2 text-[11px] ${muted}`}>
                  {page} / {pagination.pages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.pages, prev + 1)
                    )
                  }
                  className={`${actionButton} disabled:cursor-not-allowed`}
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ====================================================
            MODAL: VIEW USER
        ==================================================== */}

        {modal?.type === "view" && (
          <Modal
            dark={dark}
            width="max-w-[700px]"
            title="User details"
            subtitle="Account information and affiliate configuration."
            onClose={() => setModal(null)}
          >
            {detailLoading ? (
              <div className="flex justify-center py-16">
                <Loader2
                  size={25}
                  className="animate-spin text-[#F97316]"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-[18px] font-bold text-white">
                    {initials(selectedUser?.name)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold">
                      {selectedUser?.name}
                    </h3>

                    <p className={`mt-1 break-all text-[12px] ${muted}`}>
                      {selectedUser?.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        value={selectedUser?.role}
                        type="role"
                        dark={dark}
                      />

                      <Badge
                        value={selectedUser?.status}
                        dark={dark}
                      />
                    </div>
                  </div>
                </div>

                <div className={`border-t ${border}`} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Detail
                    label="Full name"
                    value={selectedUser?.name}
                    dark={dark}
                  />

                  <Detail
                    label="Email"
                    value={selectedUser?.email}
                    dark={dark}
                  />

                  <Detail
                    label="Mobile"
                    value={selectedUser?.mobile}
                    dark={dark}
                  />

                  <Detail
                    label="User ID"
                    value={selectedUser?._id}
                    dark={dark}
                    mono
                  />

                  <Detail
                    label="Account created"
                    value={formatDate(selectedUser?.createdAt, true)}
                    dark={dark}
                  />

                  <Detail
                    label="Last updated"
                    value={formatDate(selectedUser?.updatedAt, true)}
                    dark={dark}
                  />

                  <Detail
                    label="Last login"
                    value={formatDate(selectedUser?.lastLoginAt, true)}
                    dark={dark}
                  />

                  <Detail
                    label="Password changed"
                    value={formatDate(
                      selectedUser?.passwordChangedAt,
                      true
                    )}
                    dark={dark}
                  />

                  <Detail
                    label="Password setup"
                    value={
                      selectedUser?.mustChangePassword
                        ? "Pending"
                        : "Completed"
                    }
                    dark={dark}
                  />

                  <Detail
                    label="Account status"
                    value={selectedUser?.status}
                    dark={dark}
                  />
                </div>

                {selectedUser?.role === "affiliate" &&
                  selectedUser?.affiliate && (
                    <div className={`rounded-xl border p-4 ${subtle} ${border}`}>
                      <div className="mb-4 flex items-center gap-2">
                        <Handshake
                          size={18}
                          className="text-[#F97316]"
                        />

                        <h4 className="text-[13px] font-semibold">
                          Affiliate details
                        </h4>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Detail
                          label="Referral code"
                          value={selectedUser.affiliate.code}
                          dark={dark}
                          mono
                        />

                        <Detail
                          label="Commission type"
                          value={selectedUser.affiliate.commissionType}
                          dark={dark}
                        />

                        <Detail
                          label="Commission value"
                          value={formatCommission(selectedUser.affiliate)}
                          dark={dark}
                        />

                        <Detail
                          label="Referral status"
                          value={selectedUser.affiliate.status}
                          dark={dark}
                        />
                      </div>
                    </div>
                  )}

                {selectedUser?.statusReason && (
                  <div className={`rounded-lg border p-4 ${subtle} ${border}`}>
                    <p className="text-[12px] font-semibold">
                      Account status reason
                    </p>

                    <p className={`mt-2 text-[12px] leading-6 ${muted}`}>
                      {selectedUser.statusReason}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className={`${actionButton} h-10`}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const user = selectedUser;
                      setModal(null);
                      openEdit(user);
                    }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white"
                  >
                    <Edit3 size={15} />
                    Edit user
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}

        {/* ====================================================
            MODAL: EDIT USER
        ==================================================== */}

        {modal?.type === "edit" && (
          <Modal
            dark={dark}
            width="max-w-[650px]"
            title="Edit user"
            subtitle="Update profile, account role and affiliate settings."
            onClose={() => {
              if (!busy) setModal(null);
            }}
            busy={busy}
          >
            {detailLoading ? (
              <div className="flex justify-center py-16">
                <Loader2
                  size={25}
                  className="animate-spin text-[#F97316]"
                />
              </div>
            ) : selectedUser ? (
              <UserEditForm
                key={selectedUser._id}
                user={selectedUser}
                dark={dark}
                saving={busy}
                onSave={saveUser}
                onCancel={() => setModal(null)}
              />
            ) : null}
          </Modal>
        )}

        {/* ====================================================
            MODAL: MORE ACTIONS
        ==================================================== */}

        {modal?.type === "more" && (
          <Modal
            dark={dark}
            title="Manage account"
            subtitle={modal.user?.name}
            onClose={() => setModal(null)}
          >
            <div className="space-y-3">
              {[
                {
                  icon: KeyRound,
                  title: modal.user?.mustChangePassword
                    ? "Resend password setup email"
                    : "Send password reset email",
                  description:
                    "Issue a secure, time-limited password link.",
                  onClick: () =>
                    setModal({
                      type: "password",
                      user: modal.user,
                    }),
                },
                {
                  icon: LogOut,
                  title: "Log out all devices",
                  description:
                    "Revoke all active sessions and tokens.",
                  onClick: () =>
                    setModal({
                      type: "logout",
                      user: modal.user,
                    }),
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={action.onClick}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      dark
                        ? "border-[#383838] hover:bg-[#252525]"
                        : "border-[#E8E8E8] hover:bg-[#F9F9F9]"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="shrink-0 text-[#F97316]"
                    />

                    <div className="flex-1">
                      <p className="text-[12px] font-semibold">
                        {action.title}
                      </p>

                      <p className={`mt-1 text-[11px] ${muted}`}>
                        {action.description}
                      </p>
                    </div>

                    <ChevronRight size={16} className={muted} />
                  </button>
                );
              })}

              {/* ACCOUNT STATUS */}

              <div className={`border-t pt-4 ${border}`}>
                <h3 className="mb-3 text-[12px] font-semibold">
                  Account access
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      disabled={
                        modal.user?.status === status.value ||
                        isSelf(modal.user, currentUserId)
                      }
                      onClick={() => {
                        setStatusReason("");

                        setModal({
                          type: "status",
                          user: modal.user,
                          nextStatus: status.value,
                        });
                      }}
                      className={`rounded-lg border px-3 py-3 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${outlineButton}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AFFILIATE REFERRAL STATUS */}

              {modal.user?.role === "affiliate" && (
                <div className={`border-t pt-4 ${border}`}>
                  <h3 className="mb-2 text-[12px] font-semibold">
                    Affiliate referrals
                  </h3>

                  <p className={`mb-3 text-[11px] leading-5 ${muted}`}>
                    Disabling referrals does not block account login.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "active", label: "Enable referrals" },
                      { value: "inactive", label: "Disable referrals" },
                    ].map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        disabled={
                          modal.user.affiliate?.status === status.value
                        }
                        onClick={() =>
                          setModal({
                            type: "affiliateStatus",
                            user: modal.user,
                            nextStatus: status.value,
                          })
                        }
                        className={`rounded-lg border px-3 py-3 text-[11px] font-semibold disabled:opacity-40 ${outlineButton}`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DELETE */}

              <div className={`border-t pt-4 ${border}`}>
                <button
                  type="button"
                  disabled={isSelf(modal.user, currentUserId)}
                  onClick={() =>
                    setModal({
                      type: "delete",
                      user: modal.user,
                    })
                  }
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors disabled:opacity-40 ${
                    dark
                      ? "border-red-500/25 bg-red-500/5 hover:bg-red-500/10"
                      : "border-red-200 bg-red-50 hover:bg-red-100"
                  }`}
                >
                  <Trash2 size={18} className="text-red-500" />

                  <div>
                    <p className="text-[12px] font-semibold text-red-500">
                      Delete account
                    </p>

                    <p className={`mt-1 text-[11px] ${muted}`}>
                      Soft delete this user and revoke all sessions.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ====================================================
            MODAL: STATUS CHANGE
        ==================================================== */}

        {modal?.type === "status" && (
          <Modal
            dark={dark}
            busy={busy}
            title="Change account status"
            subtitle={`Update ${modal.user?.name}'s account access.`}
            onClose={() => setModal(null)}
          >
            <div className="space-y-5">
              <div className={`rounded-lg border p-4 ${subtle} ${border}`}>
                <p className={`text-[11px] ${muted}`}>
                  New account status
                </p>

                <div className="mt-2">
                  <Badge
                    value={modal.nextStatus}
                    dark={dark}
                  />
                </div>

                <p className={`mt-3 text-[11px] leading-6 ${muted}`}>
                  This action will revoke the user's existing
                  sessions. If you reactivate an account, the
                  user must sign in again.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold">
                  Reason (optional)
                </label>

                <textarea
                  rows={3}
                  maxLength={500}
                  value={statusReason}
                  onChange={(event) =>
                    setStatusReason(event.target.value)
                  }
                  placeholder="Reason for changing account status..."
                  className={`w-full resize-none rounded-lg border p-3 text-[12px] outline-none focus:border-[#F97316] ${
                    dark
                      ? "border-[#444] bg-[#202020] text-white"
                      : "border-[#DDD] bg-white"
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModal(null)}
                  className={`${actionButton} h-11 flex-1`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={updateStatus}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  Confirm change
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ====================================================
            CONFIRMATION MODALS
        ==================================================== */}

        {[
          "password",
          "logout",
          "affiliateStatus",
          "delete",
        ].includes(modal?.type) && (
          <Modal
            dark={dark}
            busy={busy}
            title={
              modal.type === "password"
                ? "Send password link?"
                : modal.type === "logout"
                  ? "Log out all devices?"
                  : modal.type === "affiliateStatus"
                    ? "Change referral status?"
                    : "Delete this account?"
            }
            subtitle={modal.user?.name}
            onClose={() => setModal(null)}
          >
            <div className="space-y-5">
              <div
                className={`flex items-start gap-3 rounded-lg border p-4 ${subtle} ${border}`}
              >
                {modal.type === "password" ? (
                  <KeyRound
                    size={20}
                    className="shrink-0 text-[#F97316]"
                  />
                ) : modal.type === "logout" ? (
                  <LogOut
                    size={20}
                    className="shrink-0 text-[#F97316]"
                  />
                ) : modal.type === "affiliateStatus" ? (
                  <Handshake
                    size={20}
                    className="shrink-0 text-[#F97316]"
                  />
                ) : (
                  <Trash2
                    size={20}
                    className="shrink-0 text-red-500"
                  />
                )}

                <p className={`text-[12px] leading-6 ${muted}`}>
                  {modal.type === "password"
                    ? `A secure ${
                        modal.user?.mustChangePassword
                          ? "password setup"
                          : "password reset"
                      } link will be sent to ${modal.user?.email}.`
                    : modal.type === "logout"
                      ? "All sessions and authorization tokens for this account will be revoked. The user must sign in again."
                      : modal.type === "affiliateStatus"
                        ? `Affiliate referrals will be ${
                            modal.nextStatus
                          }. The user's account login status will not change.`
                        : "This account will be soft deleted. Existing sessions will be revoked, and the user will disappear from the active user list."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModal(null)}
                  className={`${actionButton} h-11 flex-1`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={
                    modal.type === "password"
                      ? sendPasswordLink
                      : modal.type === "logout"
                        ? revokeAllSessions
                        : modal.type === "affiliateStatus"
                          ? updateAffiliateStatus
                          : deleteUser
                  }
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[12px] font-semibold text-white disabled:opacity-60 ${
                    modal.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#F97316] hover:bg-[#EA650A]"
                  }`}
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : modal.type === "delete" ? (
                    <Trash2 size={15} />
                  ) : (
                    <Check size={15} />
                  )}

                  {busy
                    ? "Processing..."
                    : modal.type === "delete"
                      ? "Delete account"
                      : "Confirm"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
