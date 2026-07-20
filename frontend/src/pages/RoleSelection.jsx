import { FaShieldAlt, FaUserTie } from "react-icons/fa";
import AuthPageShell from "../components/AuthPageShell";
import FlowCard from "../components/FlowCard";

const roleOptions = [
  {
    title: "Receptionist",
    description: "Guest Management\nReceipts\nDaily Operations",
    icon: FaUserTie,
    to: "/receptionists",
    accent: "bg-hallmark/10",
  },
  {
    title: "Manager",
    description: "Settings\nUser Management",
    icon: FaShieldAlt,
    accent: "bg-[#f3e8ea]",
    disabled: true,
  },
];

export default function RoleSelection() {
  return (
    <AuthPageShell subtitle="Choose your access role to continue">
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {roleOptions.map((role) => (
          <FlowCard
            key={role.title}
            title={role.title}
            description={role.description}
            icon={role.icon}
            to={role.to}
            accent={role.accent}
            disabled={role.disabled}
          />
        ))}
      </div>
    </AuthPageShell>
  );
}
