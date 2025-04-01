export default function PageTitle({ title, icon }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {title}
        </span>
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-2 rounded-full"></div>
    </div>
  );
}
