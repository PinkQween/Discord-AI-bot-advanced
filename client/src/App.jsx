import { useState, useEffect } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';

const bufferToBase64 = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};

const App = () => {
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/');
        console.log(response.data);
        if (response.data.success) {
          setImageData(response.data.data.images);
        } else {
          console.error('Failed to fetch image data');
        }
      } catch (error) {
        console.error('Error fetching image data:', error);
      }
    };

    fetchData();
  }, []);

  const downloadAllImages = async () => {
    for (let i = 0; i < imageData.length; i++) {
      const image = imageData[i];
      const base64Data = bufferToBase64(image.image.data);
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${base64Data}`;
      link.download = `${image.prompt}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay between downloads (adjust as needed)
    }
  };

  return (
    <div>
      <h1>Image Gallery</h1>
      <button onClick={downloadAllImages}>Download All</button>
      <div className="image-list">
        {imageData.map((image, index) => (
          <div key={index} className="image-item">
            <h2>{image.prompt}</h2>
            <img src={`data:image/jpeg;base64,${bufferToBase64(image.image.data)}`} alt={image.prompt} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;