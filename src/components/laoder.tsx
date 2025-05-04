

const Loader= () => {
 
  return (
    <div className="pt-18 grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto px-2">
    {Array.from({ length: 9 }).map((_, index) => (
        <div
            key={index}
            className="bg-[#1F1D1D] shadow-md hover:border-gray-500 border-2 border-transparent rounded-lg p-4 flex flex-col items-center text-center animate-pulse"
        >
            <div className="w-32 h-32 object-cover mb-4 rounded bg-gray-700" />
            <h2 className="text-lg font-semibold h-5 bg-[#535252] w-32 rounded-sm"></h2>
            <p className="bg-[#3f3939] h-4 mt-2 w-20 rounded-sm"></p>
            <p className="bg-[#3f3939] text-sm mt-2 w-24 h-3 rounded-sm"></p>
        </div>
    ))}
</div>
  );
};

export default Loader;
