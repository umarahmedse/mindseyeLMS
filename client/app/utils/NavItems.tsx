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
  return <></>;
};

export default NavItems;
// 31:32
