import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

function CategorySlider({ categories, selectedCategory, setSelectedCategory }) {
  // Custom Previous Arrow
  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Previous Slide"
        className="absolute -left-5 top-1/2 transform -translate-y-1/2 z-10
                   text-white rounded-full p-[7px] shadow-md 
                   hover:bg-green-500 hover:scale-105 transition duration-200 focus:outline-none"
      >
        <IoIosArrowBack size={24} />
      </button>
    );
  };

  // Custom Next Arrow
  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Next Slide"
        className="absolute -right-5 top-1/2 transform -translate-y-1/2 z-10 
                   text-white rounded-full p-[7px] shadow-md
                   hover:bg-green-500 hover:scale-105 transition duration-200 focus:outline-none"
      >
        <IoIosArrowForward size={24} />
      </button>
    );
  };

  const sliderSettings = {
    accessibility: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    swipeToSlide: true,
    draggable: true,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    appendDots: (dots) => (
      <div
        style={{
          position: "relative",
          bottom: "-20px",
          width: "100%",
        }}
      ></div>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div
      className="relative max-w-screen-lg mx-auto my-16 px-4 py-4 rounded-full"
      style={{ background: "#11151E" }}
    >
      <Slider {...sliderSettings}>
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-3 flex justify-center items-center"
          >
            <div
              role="button"
              tabIndex={0}
              className={`p-1
                md:p-2 rounded-full cursor-pointer shadow-md text-center text-md
                transition-transform focus:outline-none
                ${
                  selectedCategory === category.id
                    ? "bg-green-800 text-gray-100"
                    : "bg-orange-50"
                }
                hover:text-gray-800 hover:scale-105 hover:ring-2 hover:ring-orange-700 hover:ring-offset-2
              `}
              onClick={() => setSelectedCategory(category.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedCategory(category.id);
                }
              }}
            >
              {category.name}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CategorySlider;
