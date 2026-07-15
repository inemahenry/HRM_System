import { FaUserCircle } from "react-icons/fa";
import AuthPageShell from "../components/AuthPageShell";
import FlowCard from "../components/FlowCard";

const receptionists = ["Bruno", "Mutesi", "Grace", "Ellie"];

export default function ReceptionistSelection() {
  return (
    <AuthPageShell subtitle="Select the receptionist to continue">
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {receptionists.map((name) => (
          <FlowCard
            key={name}
            title={name}
            description="Reception Desk"
            icon={FaUserCircle}
            to="/password"
            state={{ receptionistName: name }}
            accent="bg-[#f8f2f3]"
          />
        ))}
      </div>
    </AuthPageShell>
  );
}
