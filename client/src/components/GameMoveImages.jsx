import React, { useState, useEffect } from "react";
import { getPlayerMoveImage, getOpponentMoveImage } from "../helpers/getMoveImage"; // Import helper methods

const GameMoveImages = ({ move, isPlayer, startImage }) => {
  const [imageAnimating, setImageAnimating] = useState(false); // Track animation state
  const [finalMoveImage, setFinalMoveImage] = useState(null);

  useEffect(() => {
    // Start bounce animation if move is selected
    if (move) {
      setImageAnimating(true);

      // After 2 bounces, switch to the actual move image
      setTimeout(() => {
        setImageAnimating(false);
        setFinalMoveImage(isPlayer ? getPlayerMoveImage(move) : getOpponentMoveImage(move)); // Update with the selected move image
      }, 1000); // 1000ms = duration of 2 bounces
    }
  }, [move, isPlayer]);

  const renderImage = () => {
    const imageSrc = move == null || imageAnimating ? startImage : finalMoveImage;

    return (
      <img
        src={imageSrc} // Dynamically load the image
        alt={`Move ${move}`}
        className={`move-image ${imageAnimating ? "bounce" : ""} ${finalMoveImage ? "transform" : ""}`}
      />
    );
  };

  return (
    <div className="flex justify-center gap-6 mb-4">
      {renderImage()}
    </div>
  );
};

export default GameMoveImages;