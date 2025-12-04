export default function ImposterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="px-3 pt-3 pb-10">{children}</div>;
}
