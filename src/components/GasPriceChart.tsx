import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

// Helper function to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Helper function to parse color to hex
const parseColorToHex = (colorString: string): string => {
  if (colorString.startsWith('#')) {
    return colorString;
  }
  
  // Handle HSL format (both space and comma separated)
  const hslMatch = colorString.match(/hsl\(\s*(\d+)(?:,\s*|\s+)(\d+)%(?:,\s*|\s+)(\d+)%\s*\)/);
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    return hslToHex(parseInt(h), parseInt(s), parseInt(l));
  }
  
  // Fallback to a default color
  return '#000000';
};

export const GasPriceChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Get computed styles for theme colors
    const computedStyle = getComputedStyle(document.documentElement);
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();
    
    // Convert colors to hex format
    const backgroundHex = parseColorToHex(`hsl(${backgroundColor})`);
    const foregroundHex = parseColorToHex(`hsl(${foregroundColor})`);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundHex },
        textColor: foregroundHex,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: {
          color: '#e0e0e0',
        },
        horzLines: {
          color: '#e0e0e0',
        },
      },
      timeScale: {
        borderColor: foregroundHex,
      },
      rightPriceScale: {
        borderColor: foregroundHex,
      },
    });

    chartRef.current = chart;

    // Sample gas price data
    const lineSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });

    const data = [
      { time: '2024-01-01', value: 20 },
      { time: '2024-01-02', value: 25 },
      { time: '2024-01-03', value: 18 },
      { time: '2024-01-04', value: 30 },
      { time: '2024-01-05', value: 22 },
      { time: '2024-01-06', value: 28 },
      { time: '2024-01-07', value: 35 },
    ];

    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Gas Prices</h2>
      <div 
        ref={chartContainerRef} 
        className="w-full border border-border rounded-lg"
        style={{ height: '400px' }}
      />
    </div>
  );
};