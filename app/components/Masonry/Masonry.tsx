import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

export interface MasonryItem {
  element: React.ReactNode;
  size: { width: number; height: number };
}

export interface MasonryProps {
  items: MasonryItem[];
  gutter: number;
  columns: number;
  className?: string;
}

export function Masonry({ items, gutter, columns, className }: MasonryProps) {
  const [columnItems, setColumnItems] = useState<MasonryItem[][]>([]);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    columnRefs.current = Array(columns).fill(null);

    const newColumnItems: MasonryItem[][] = Array(columns)
      .fill(null)
      .map(() => []);

    if (columns === 0) {
      setColumnItems(newColumnItems);
      return;
    }

    const heights = Array(columns).fill(0);
    const middleColumnIndex = Math.floor(columns / 2);

    items.forEach((item) => {
      // Find column with minimum height
      const minHeight = Math.min(...heights);

      // If multiple columns have the same minimum height,
      // prefer the middle column
      const minHeightColumns = heights
        .map((height, index) => ({ height, index }))
        .filter((col) => col.height === minHeight);

      let columnIndex =
        minHeightColumns.length > 1 &&
        minHeightColumns.some((col) => col.index === middleColumnIndex)
          ? middleColumnIndex
          : heights.indexOf(minHeight);

      // Add item to column
      newColumnItems[columnIndex].push(item);

      // Calculate normalized height and update column height
      const normalizedHeight = item.size.height / item.size.width;
      heights[columnIndex] += normalizedHeight + gutter / 100;
    });

    setColumnItems(newColumnItems);
  }, [items, columns, gutter]);

  return (
    <div className={cn("relative w-full bg-neutral-100", className)}>
      <div
        className="flex gap-[var(--gutter)]"
        style={{ "--gutter": `${gutter}px` } as any}
      >
        {Array.from({ length: columns }, (_, columnIndex) => (
          <div
            key={columnIndex}
            ref={(el) => (columnRefs.current[columnIndex] = el)}
            className="flex-1 flex flex-col gap-[var(--gutter)]"
          >
            {columnItems[columnIndex]?.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="w-full"
                style={{
                  aspectRatio: `${item.size.width} / ${item.size.height}`,
                }}
              >
                {item.element}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
