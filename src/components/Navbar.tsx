import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav className="bg-[#1a1a1a] border-b border-[#333] py-1.5 px-4 w-full">
            <div className="flex justify-between items-center max-w-[1200px] mx-auto">
                <Link
                    to="/"
                    className="text-2xl font-bold text-white no-underline"
                >
                    PianoLab
                </Link>
                <div className="flex gap-4">
                    {/*<Link*/}
                    {/*    to="/"*/}
                    {/*    className="text-[#aaa] no-underline transition-colors duration-300 hover:text-white"*/}
                    {/*>*/}
                    {/*    Home*/}
                    {/*</Link>*/}
                </div>
            </div>
        </nav>
    );
};
