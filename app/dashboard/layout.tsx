import DashboardLayout from "@/components/DashboardLayout";
import { requireRole } from "@/lib/gurde";

export default async function DashboardRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Ensure the user is a USER or ADMIN
    await requireRole(["USER", "ADMIN"]);

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
