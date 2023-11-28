import Link from "next/link";
import React, { FC, useState } from "react";

const navItemsData = [
  {
    name: "Home",
    url: "/home",
  },
  {
    name: "Courses",
    url: "/courses",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Policy",
    url: "/policy",
  },
  {
    name: "FAQ",
    url: "/faq",
  },
];

type Props = {
  activeItem: number;
  isMobile: boolean;
};
const NavItems: FC<Props> = ({ activeItem, isMobile }) => {
  return (
    <>
      <div className="hidden 800px:flex">
        {navItemsData &&
          navItemsData.map((item, index) => (
            <Link href={item.url} key={index} passHref>
              <span
                className={`${
                  activeItem === index
                    ? "dark:text-[#a37a39a] text-[crimson]"
                    : " dark:text-white text-black"
                } text-[18px] px-6 font-Poppins font-[400]`}
              >
                {item.name}
              </span>
            </Link>
          ))}
      </div>
      {isMobile && (
        <>
          <div className="w-full text-center py-6">
            <Link
              href={"/"}
              className={`test-[25px] font-Poppins font-[500] text-black dark:text-white`}
            >
              MindsEye Mentor
            </Link>{" "}
          </div>
          <div className="800px:hidden mt-5">
            {navItemsData &&
              navItemsData.map((item, index) => (
                <Link href="/" passHref key={index}>
                  <span
                    className={`${
                      activeItem === index
                        ? "dark:text-[#a37a39a] text-[crimson]"
                        : " dark:text-white text-black"
                    } block text-[18px] px-6 py-5 font-Poppins font-[400]`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default NavItems;
