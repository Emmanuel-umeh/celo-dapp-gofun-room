import React from "react";
import { Link } from "react-router-dom";
import defaultImage from "../images/defaultBcg.jpeg";
import PropTypes from "prop-types";

export default function Room({ key, room }) {
  const { index, name, imageURL, price } = room;
  let divStyle = {
    width: "calc(0px + 100%)",
  }
  console.log(key);
  console.log(room);
  return (
    <div>
      <div className="room-name-container">
        <div className="room-info">{name} <p>Starting at: ${price / 1000000000000000000}</p></div>

      </div>
      <article className="room">
        <Link to={`/rooms/${index}`} className="cta line--link-animation" >

          <div className="img-container">
            <img src={imageURL[0] || defaultImage} alt="single project" />

          </div>
          <div className="explore-btn">
            <span className="room-info-btn">Explore</span>
          </div>
        </Link>

      </article >
    </div>
  );
}

Room.propTypes = {
  room: PropTypes.shape({
    name: PropTypes.string.isRequired,
    zebra: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    price: PropTypes.number.isRequired
  })
};
