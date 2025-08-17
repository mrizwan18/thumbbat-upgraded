import React, { useState, useEffect } from "react";
import { getPlayerMoveImage, getOpponentMoveImage } from "@/lib/getMoveImage"; // Import helper methods
import { StaticImageData } from "next/image";
import Image from "next/image";

const GameMoveImages = ({
  playerMove,
  opponentMove,
  isPlayer,
  startImage,
}: {
  playerMove: number;
  opponentMove: number;
  isPlayer: boolean;
  startImage: string;
}) => {
  const [imageAnimating, setImageAnimating] = useState(false); // Track animation state
  const [finalMoveImage, setFinalMoveImage] = useState<
    string | StaticImageData | null
  >(null);

  useEffect(() => {
    // Start bounce animation if move is selected
    if (playerMove && opponentMove) {
      setImageAnimating(true);
      setFinalMoveImage(null);

      // After 2 bounces, switch to the actual move image
      setTimeout(() => {
        setImageAnimating(false);
        setFinalMoveImage(
          isPlayer
            ? getPlayerMoveImage(playerMove)
            : getOpponentMoveImage(opponentMove)
        );
      }, 1000);
    }
  }, [playerMove, opponentMove, isPlayer]);

  const renderImage = () => {
    const imageSrc =
      playerMove == null || imageAnimating
        ? startImage
        : finalMoveImage ?? startImage;

    return (
      <Image
        src={imageSrc}
        alt={`Move ${playerMove}`}
        width={100}
        height={100}
        className={`move-image ${imageAnimating ? "bounce" : ""} ${
          finalMoveImage ? "transform" : ""
        }`}
        style={{ width: "auto", height: "auto" }}
      />
    );
  };

  return <div className="flex justify-center gap-6 mb-4">{renderImage()}</div>;
};

export default GameMoveImages;
