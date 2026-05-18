// src/components/empty-state.tsx
type Props = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export function EmptyState({ icon, title, description }: Props) {
    return (
        <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
            <div className="rounded-full bg-muted p-4">
                {icon}
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        </div>
    );
}