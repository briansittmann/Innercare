# Verificación de la compuerta (cuerpo único, fase 1)

Recortes del verificador, base contra prototipo (`?cuerpo-unico`).

- `antes/`: primera pasada, veredicto NO PASA por el filo blanco en el borde del corte bajo el hombro derecho (`det-esc-corte.png`, `esc-1x-abajo.png`, `cel-abajo.png`, `vivo-cel-corte.png`). `vivo-esc-tira.png`: la intro en vivo, base y prototipo lado a lado.
- `despues/`: segunda pasada, tras el commit `8228f5d`, veredicto PASA. El corte se ve recto como el del busto (`det-esc-corte.png`, `vivo-cel-scroll-1.2.png`); pose y vaivén a los 9 s coinciden (`vivo-esc-f08.png`). `esc-mov16.png` muestra el atraso del vaivén en la captura a 16 s, atribuido a Chrome a 30 fps en batería.

Diferencias menores que quedan (solo con zoom): borde del corte algo escalonado en el celular a 2x, contorno de oreja y nuca algo más marcado, vértebras bajas apenas distintas, reflejo bajo el borde de la craneoplastía con otra forma. Los fps no se remidieron en la verificación porque la Mac estaba en batería; la caída de 4,6 % en escritorio queda pendiente para la fase 3 (canvas al tamaño de la caja del hero).

La hoja completa está en `../comparacion.html`.
