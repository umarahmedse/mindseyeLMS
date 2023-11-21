"use client";
import React, { FC, useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
interface Props {}
const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <>
      <Heading
        title="MindsEye Mentor"
        description="Psychology Companion - All In Here"
        keywords="depression,psychology,mind,behaviour"
      />
      <Header open={open} activeItem={activeItem} setOpen={setOpen} />
    </>
  );
};

export default Page;
// 15:46
