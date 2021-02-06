import React, { FormEvent, ChangeEvent, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MapContainer, Marker, TileLayer,useMapEvents } from 'react-leaflet';

import '../styles/pages/createorphanage.css';
import SideBar from "../components/SideBar";
import mapIcon from "../utils/mapIcon";
import api from "../services/api";
import { useHistory } from "react-router-dom";

//1:12:08
export default function OrphanagesMap() {
    const history = useHistory();

    const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [instructions, setInstructions] = useState('');
    const [opening_hours, setOpeningHours] = useState('');
    const [open_on_weekends, setOpenOnWeekends] = useState(true);
    const [images, setImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    //to remove images, remove from images and previewImages

    function handleSelectedImages(event: ChangeEvent<HTMLInputElement>) {
        if (!event.target.files) { return;} 
        const selectedImages = Array.from(event.target.files)
        setImages(selectedImages);
        const selectedImagesPreview = selectedImages.map(image => {
            return URL.createObjectURL(image);  
        })
        setPreviewImages(selectedImagesPreview);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const {latitude, longitude} = position;
        const data = new FormData();
        data.append('name', name);
        data.append('about', about);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('instructions', instructions);
        data.append('opening_hours', opening_hours);
        data.append('open_on_weekends', String(open_on_weekends));
        images.forEach(image => {
            data.append('images', image);
        })
        await api.post('orphanages', data);
        alert('Cadastro realizado com sucesso!');
        history.push('/app');
    }

    function AddMarkerToClick() {

        const map = useMapEvents({
        click(event) {
            const { lat, lng } = event.latlng;
            setPosition({
            latitude: lat,
            longitude: lng,
            });
        },
        });
        
        return (
            position.latitude !== 0 ? (
                <Marker
                position={[position.latitude, position.longitude]}
                interactive={false}
                icon={mapIcon}
                />
            ) : null       
        )
    }
    

    return (
        <div id="page-create-orphanage">

                <SideBar />

        <main>
            <form onSubmit={handleSubmit} className="create-orphanage-form">
            <fieldset>
                <legend>Dados</legend>

                <MapContainer 
                    center={[-23.4209995,-51.9330558]}
                    style={{ width: '100%', height: 280 }}
                    zoom={15}
                >
                    <TileLayer 
                        url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
                    />
                <AddMarkerToClick/>
                </MapContainer>

                <div className="input-block">
                    <label htmlFor="name">Nome</label>
                    <input id="name" value={name} onChange={ event => setName(event.target.value) } />
                </div>

                <div className="input-block">
                    <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
                    <textarea id="name" maxLength={300} value={about} onChange={ event => setAbout(event.target.value) } />
                </div>

                <div className="input-block">
                    <label htmlFor="images">Fotos</label>

                    <div className="images-container">
                        {previewImages.map(image => {
                            return (
                                <img key={image} src={image} alt={name} />
                            )
                        })}
                        <label htmlFor="image[]" className="new-image">
                            <FiPlus size={24} color="#15b6d6" />
                        </label>
                    </div>

                    <input multiple type="file" id="image[]" onChange={handleSelectedImages} />

                </div>
            </fieldset>

            <fieldset>
                <legend>Visitação</legend>

                <div className="input-block">
                <label htmlFor="instructions">Instruções</label>
                <textarea id="instructions" value={instructions} onChange={ event => setInstructions(event.target.value) } />
                </div>

                <div className="input-block">
                <label htmlFor="opening_hours">Horário de funcionamento</label>
                <input id="opening_hours" value={opening_hours} onChange={ event => setOpeningHours(event.target.value) } />
                </div>

                <div className="input-block">
                <label htmlFor="open_on_weekends">Atende fim de semana</label>

                <div className="button-select">
                    <button
                        type="button"
                        className={ open_on_weekends ? 'active' : '' }
                        onClick={() => setOpenOnWeekends(true)}
                    >
                        Sim
                    </button>
                    <button
                        type="button"
                        className={ !open_on_weekends ? 'active' : '' }
                        onClick={() => setOpenOnWeekends(false)}
                    >
                        Não
                    </button>
                </div>
                </div>
            </fieldset>

            <button type="submit" className="confirm-button">
                Confirmar
                </button>
            </form>
        </main>
        </div>
    )
}