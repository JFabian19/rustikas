export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

export interface Category {
  id: string;
  nombre: string;
  destacada?: boolean;
  horario?: string;
  items: Dish[];
}

const item = (nombre: string, precio: string, descripcion?: string, imagen?: string): Dish => ({ nombre, precio, descripcion, imagen });

// Carta transcrita de las piezas gráficas proporcionadas por Rustikas.
export const DEFAULT_MENU_DATA: Category[] = [
  { id: 'menu-brasa', nombre: 'Menú brasa', destacada: true, horario: 'Disponible de 12:00 p. m. a 5:00 p. m.', items: [
    item('1/8 pollo a la brasa', 'S/ 10.00', 'Papas + chaufa + refresco + aguadito', '/menu-brasa-1-8-pollo.webp'),
  ] },
  { id: 'pollos-a-la-brasa', nombre: 'Pollos a la brasa', items: [
    item('Octavo p/brasa', 'S/ 8.50', '1/8 pollo + papas + ensalada + cremas', '/pollo-brasa-octavo.webp'),
    item('Cuarto p/brasa', 'S/ 10.00', '1/4 pollo + papas + ensalada + cremas', '/pollo-brasa-cuarto.webp'),
    item('Medio p/brasa', 'S/ 20.00', '1/2 pollo + papas + ensalada + cremas', '/pollo-brasa-medio.webp'),
    item('Entero p/brasa', 'S/ 40.00', '1 pollo + papas + ensalada + cremas', '/pollo-brasa-entero.webp'),
    item('Octavo mostrito', 'S/ 12.00', '1/8 pollo + papas + chaufa + ensalada + cremas', '/pollo-mostrito-octavo.webp'),
    item('Cuarto mostro', 'S/ 14.00', '1/4 pollo + papas + chaufa + ensalada + cremas', '/pollo-mostrito-cuarto.webp'),
  ] },
  { id: 'combos-personales', nombre: 'Combos personales', items: [
    item('Octavo p/brasa', 'S/ 11.50', 'Papas + Pepsi 750 ml + ensalada + cremas', '/combo-octavo-pepsi.webp'),
    item('Cuarto p/brasa', 'S/ 13.00', 'Papas + Pepsi 750 ml + ensalada + cremas', '/combo-cuarto-pepsi.webp'),
    item('Octavo mostrito', 'S/ 15.00', 'Papas + chaufa + Pepsi 750 ml + ensalada + cremas', '/combo-octavo-mostrito-pepsi.webp'),
    item('Cuarto mostro', 'S/ 17.00', 'Papas + chaufa + Pepsi 750 ml + ensalada + cremas', '/combo-cuarto-mostrito-pepsi.webp'),
    item('Octavo + chicha', 'S/ 12.50', 'Papas + 1/2 L de chicha + ensalada + cremas', '/combo-octavo-chicha.webp'),
    item('Cuarto + chicha', 'S/ 14.00', 'Papas + 1/2 L de chicha + ensalada + cremas', '/combo-cuarto-chicha.webp'),
  ] },
  { id: 'combos-familiares', nombre: 'Combos familiares', items: [
    item('Combo para dos', 'S/ 24.50', '1/2 pollo a la brasa + papas + Pepsi 1.5 L + ensalada + cremas', '/combo-para-dos.webp'),
    item('Combo Pepsi', 'S/ 25.50', '1/2 pollo a la brasa + papas + Pepsi 1.5 L + ensalada + cremas', '/combo-pepsi-familiar.webp'),
    item('Dúo chaufereo', 'S/ 30.00', '1/2 pollo a la brasa + papas + chaufa + ensalada + cremas', '/duo-chaufereo.webp'),
    item('Dúo tradicional', 'S/ 28.00', '1/2 pollo a la brasa + papas + chicha morada 1 L + ensalada + cremas', '/duo-tradicional.webp'),
    item('Combo clásico', 'S/ 46.00', '1 pollo a la brasa + papas + Inca o Coca Cola 1.5 L + ensalada + cremas', '/combo-clasico.webp'),
    item('Combo chaufereo', 'S/ 50.00', '1 pollo a la brasa + papas + chaufa + ensalada + cremas', '/combo-chaufereo.webp'),
    item('Combo tradicional', 'S/ 47.00', '1 pollo a la brasa + chicha morada 1 L + papas + ensalada + cremas', '/combo-tradicional.webp'),
    item('A la brasa con yapa', 'S/ 47.00', '1 pollo a la brasa + 1/4 de pollo + papas + ensalada + cremas', '/brasa-con-yapa.webp'),
    item('Familiar peruano', 'S/ 50.00', '1 pollo a la brasa + Inca o Coca Cola 3 L + papas + ensalada + cremas', '/familiar-peruano.webp'),
    item('Familiar Pepsi', 'S/ 53.00', '1 pollo a la brasa + Pepsi 1.5 L + papas + ensalada + cremas', '/familiar-pepsi.webp'),
    item('Mega familiar', 'S/ 56.00', '1 pollo a la brasa + Inca o Coca Cola 1.5 L + 1/4 de pollo + papas + ensalada + cremas', '/mega-familiar.webp'),
  ] },
  { id: 'chifa', nombre: 'Chifa', items: [
    item('Arroz chaufa de pollo', 'S/ 12.00', undefined, '/chaufa-pollo.webp'), item('Aeropuerto', 'S/ 14.00', undefined, '/aeropuerto.webp'), item('Tallarín chifa', 'S/ 16.00', undefined, '/tallarin-chifa.webp'), item('Salvaje', 'S/ 15.00', undefined, '/salvaje.webp'), item('Combinado', 'S/ 18.00', undefined, '/combinado.webp'),
  ] },
  { id: 'extras', nombre: 'Extras', items: [
    item('Porción de papas fritas', 'S/ 11.00', undefined, '/papas-fritas.webp'), item('Media porción de papas fritas', 'S/ 7.00', undefined, '/media-papas-fritas.webp'), item('Porción de ensalada', 'S/ 6.00', undefined, '/ensalada.webp'), item('Media porción de ensalada', 'S/ 3.00', undefined, '/media-ensalada.webp'), item('Porción de chaufa', 'S/ 4.00', undefined, '/porcion-chaufa.webp'),
  ] },
  { id: 'bebidas', nombre: 'Bebidas', items: [
    item('Inca o Coca Cola personal', 'S/ 2.50', undefined, '/bebida-personal.webp'), item('Inca o Coca Cola 600 ml', 'S/ 4.00', undefined, '/bebida-inca-600.webp'), item('Inca o Coca Cola 1 L', 'S/ 7.00', undefined, '/bebida-inca-1l.webp'), item('Inca o Coca Cola 1.5 L', 'S/ 9.00', undefined, '/bebida-inca-1-5l.webp'), item('Inca o Coca Cola 2.25 L', 'S/ 11.00', undefined, '/bebida-inca-2-25l.webp'), item('Inca o Coca Cola 3 L', 'S/ 14.00', undefined, '/bebida-inca-3l.webp'), item('Gordita', 'S/ 5.00', undefined, '/bebida-gordita.webp'),
    item('Pepsi 750 ml', 'S/ 4.00', undefined, '/bebida-pepsi-750.webp'), item('Pepsi 1 L', 'S/ 5.50', undefined, '/bebida-pepsi-1l.webp'), item('Pepsi 1.5 L', 'S/ 6.50', undefined, '/bebida-pepsi-1-5l.webp'), item('Pepsi 2 L', 'S/ 7.50', undefined, '/bebida-pepsi-2l.webp'), item('Pepsi 3 L', 'S/ 11.00', undefined, '/bebida-pepsi-3l.webp'), item('Agua Cielo o San Luis', 'S/ 2.00', undefined, '/bebida-agua.webp'), item('Cerveza Pilsen', 'S/ 8.00', undefined, '/bebida-pilsen.webp'), item('Cusqueña trigo o negra', 'S/ 10.00', undefined, '/bebida-cusquena.webp'), item('Concordia 1.5 L', 'S/ 5.50', undefined, '/bebida-concordia.webp'), item('Pepsi, Concordia o 7up 355 ml', 'S/ 1.50', undefined, '/bebida-mix-355.webp'), item('Gatorade', 'S/ 3.00', undefined, '/bebida-gatorade.webp'),
    item('Chicha o maracuyá 1 L', 'S/ 10.00', undefined, '/bebida-chicha-maracuya-1l.webp'), item('Chicha o maracuyá 500 ml', 'S/ 6.00', undefined, '/bebida-chicha-maracuya-500.webp'), item('Infusiones (té, anís y manzanilla)', 'S/ 2.50', undefined, '/bebida-infusiones.webp'),
  ] },
];
