# DSP Lab Project

> —— Mimic Spatial Audio
>
> By [Bingcheng](https://bingcheng.openmc.cn)

---

<img src="img/img1.png" alt="img1" style="zoom: 50%;" />

In this project, android phone/ iphone is used as the head movement detector, and the spatial audio will be generated in real time.

---

As we know, human can detect the position of the source of the audio with two ears, becasue there will be a small time delay between two ears.

In this project, a test web app will be introduced to test this opinion in 2D plane for easy understanding. In the future, the 3D spatial audio will be implimented.

For 2D spatial audio, you can detect the direction of the audio, but the height of the audio can not be recognized. In this way, there will be less calculation and it will be easier for beginners to understand.

---

## TODO
- [x] Use IMUs in phones to detect head position
- [x] Do real time volume adjustment according to head position
- [ ] Find good voice for different spatial point
- [ ] 3D plot of head position and position of the spatial point
- [ ] Use AI facial position detector to make a desktop version of spatial audio

## References

- [API: AudioListener](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioListener)
- [API: PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)
- [Cartesian coordinate system](https://en.wikipedia.org/wiki/Cartesian_coordinate_system)
- [Web audio spatialization basics](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics)
- [Euler angles](https://en.wikipedia.org/wiki/Euler_angles)
- [Phone Orientaion](https://www.w3.org/TR/orientation-event/#description)
-
