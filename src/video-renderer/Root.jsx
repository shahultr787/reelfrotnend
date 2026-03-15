import React from "react";
import { Composition } from "remotion";
import { MatrimonialVideo } from "./MatrimonialVideo";

export const RemotionRoot = () => {

return (
<Composition
id="MatrimonialVideo"
component={MatrimonialVideo}
durationInFrames={24 * 8}
fps={24}
width={720}
height={1280}
defaultProps={{
info: {
name: "",
age: "",
religion: "",
education: "",
occupation: "",
city: ""
},
photo: null
}}
/>
);

};
