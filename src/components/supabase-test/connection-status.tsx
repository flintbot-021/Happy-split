interface ConnectionStatusProps {
  status: boolean | null;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        status === null ? 'bg-gray-400' :
        status ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span>
        {status === null ? 'Checking connection...' :
         status ? 'Connected to Supabase' : 'Connection failed'}
      </span>
    </div>
  );
}