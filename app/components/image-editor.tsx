"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { HexColorPicker } from "react-colorful";
import Draggable from "react-draggable";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Plus, Trash2 } from "lucide-react";

const fonts = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Playfair Display",
  "Source Sans Pro",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Nunito",
  "Quicksand",
  "Oswald",
  "Dancing Script",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Helvetica",
  "Impact",
];

interface TextLayer {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
  fontWeight: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}



export function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: "1",
      text: "Your Text Here",
      font: fonts[0],
      size: 48,
      color: "#ffffff",
      position: { x: 0, y: 0 },
      fontWeight: 400,
    },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | any> }>({});

  textLayers.forEach((layer) => {
    if (!nodeRefs.current[layer.id]) {
      nodeRefs.current[layer.id] = React.createRef();
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new global.Image(500,500);
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height
        });
      };
      const result = e.target?.result as string;
      img.src = result;
      setImage(result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("image_file", file);

      const response = await fetch(`https://api.remove.bg/v1.0/removebg`, {
        method: "POST",
        headers: {
          "X-Api-Key": `C46oUwY9qniba6dtgfN9rRFw`,
        },
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
      }
    } catch (error) {
      console.error("Error removing background:", error);
    }
  };

  const handleDownload = async () => {
    if (!editorRef.current || !imageDimensions) return;

    try {
      const dataUrl = await toPng(editorRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: imageDimensions.width,
        height: imageDimensions.height,
        canvasWidth: imageDimensions.width,
        canvasHeight: imageDimensions.height,
        skipAutoScale: true
      });
      
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleDrag = (id: string) => (e: any, data: { x: number; y: number }) => {
    setTextLayers((prev) =>
      prev.map((layer) =>
        layer.id === id
          ? { ...layer, position: { x: data.x, y: data.y } }
          : layer
      )
    );
  };

  const addNewTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: "New Text",
      font: fonts[0],
      size: 48,
      color: "#ffffff",
      position: { x: 0, y: 0 },
      fontWeight: 400,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const removeTextLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(textLayers[0]?.id || "");
    }
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };

  const selectedLayer = textLayers.find((layer) => layer.id === selectedLayerId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-gray-800"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {imageDimensions && (
            <div className="text-sm text-gray-400">
              Image dimensions: {imageDimensions.width}px × {imageDimensions.height}px
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Text Layers</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addNewTextLayer}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Text
              </Button>
            </div>

            <div className="space-y-2">
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                    selectedLayerId === layer.id
                      ? "bg-gray-700"
                      : "bg-gray-800"
                  }`}
                  onClick={() => setSelectedLayerId(layer.id)}
                >
                  <Input
                    value={layer.text}
                    onChange={(e) =>
                      updateTextLayer(layer.id, { text: e.target.value })
                    }
                    className="flex-1"
                  />
                  {textLayers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTextLayer(layer.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedLayer && (
            <>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={selectedLayer.font}
                  onValueChange={(value) =>
                    updateTextLayer(selectedLayer.id, { font: value })
                  }
                >
                  <SelectTrigger className="bg-gray-800">
                    <SelectValue>{selectedLayer.font}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[selectedLayer.size]}
                  onValueChange={(value) =>
                    updateTextLayer(selectedLayer.id, { size: value[0] })
                  }
                  min={12}
                  max={120}
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Slider
                  value={[selectedLayer.fontWeight]}
                  onValueChange={(value) =>
                    updateTextLayer(selectedLayer.id, { fontWeight: value[0] })
                  }
                  min={100}
                  max={900}
                  step={100}
                  className="py-4"
                />
                <div className="text-sm text-gray-400">
                  {selectedLayer.fontWeight}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="relative">
                  <div
                    className="w-full h-10 rounded cursor-pointer"
                    style={{ backgroundColor: selectedLayer.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <HexColorPicker
                        color={selectedLayer.color}
                        onChange={(color) =>
                          updateTextLayer(selectedLayer.id, { color })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Horizontal</Label>
                    <Slider
                      value={[selectedLayer.position.x]}
                      onValueChange={(value) =>
                        updateTextLayer(selectedLayer.id, {
                          position: { ...selectedLayer.position, x: value[0] },
                        })
                      }
                      min={0}
                      max={imageDimensions?.width || 500}
                      step={1}
                      className="py-4"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Vertical</Label>
                    <Slider
                      value={[selectedLayer.position.y]}
                      onValueChange={(value) =>
                        updateTextLayer(selectedLayer.id, {
                          position: { ...selectedLayer.position, y: value[0] },
                        })
                      }
                      min={0}
                      max={imageDimensions?.height || 500}
                      step={1}
                      className="py-4"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Download Image
          </Button>
        </div>

        <div
          ref={editorRef}
          className="relative bg-gray-800 rounded-lg overflow-hidden"
          style={{
            width: imageDimensions?.width || '100%',
            height: imageDimensions?.height || 'auto',
            maxWidth: '100%',
            margin: '0 auto'
          }}
        >
          {image && (

            <Image
            width={500}
            height={500}
              src={image}
              alt="Original"
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{
                width: imageDimensions?.width,
                height: imageDimensions?.height
              }}
            />
          )}
          
          {textLayers.map((layer) => (
            <Draggable
              key={layer.id}
              bounds="parent"
              nodeRef={nodeRefs.current[layer.id]}
              position={layer.position}
              onDrag={handleDrag(layer.id)}
            >
              <div
                ref={nodeRefs.current[layer.id]}
                className="absolute cursor-move"
                style={{
                  color: layer.color,
                  fontSize: `${layer.size}px`,
                  fontFamily: layer.font,
                  fontWeight: layer.fontWeight,
                  zIndex: 1,
                }}
              >
                {layer.text}
              </div>
            </Draggable>
          ))}

          {processedImage && (
            <Image
            width={500}
            height={500}
              src={processedImage}
              alt="Processed"
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{
                width: imageDimensions?.width,
                height: imageDimensions?.height,
                zIndex: 2
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}