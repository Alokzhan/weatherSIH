import torch
import numpy as np
from scipy.spatial import ConvexHull

class SphericalIcosahedralMesh:
    """
    Constructs an authentic 3D Spherical Icosahedral Mesh graph on the unit sphere S^2.
    Computes Great-Circle Geodesic distances, 3D Cartesian node coordinates, 
    edge attributes, and PyTorch Geometric compatible edge_index matrix.
    """
    def __init__(self, subdivision_level: int = 3):
        self.level = subdivision_level
        self.nodes_cartesian, self.nodes_latlon = self._generate_icosahedral_vertices(level=subdivision_level)
        self.num_nodes = len(self.nodes_cartesian)
        self.edge_index, self.edge_attr = self._construct_spherical_edges()

    def _generate_icosahedral_vertices(self, level: int):
        """
        Generates icosahedron base vertices and recursively subdivides triangular faces,
        projecting vertices onto the 3D unit sphere S^2.
        """
        phi = (1.0 + np.sqrt(5.0)) / 2.0  # Golden ratio
        vertices = np.array([
            [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
            [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
            [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
        ], dtype=np.float64)
        
        # Normalize to unit sphere
        vertices /= np.linalg.norm(vertices, axis=1, keepdims=True)

        faces = ConvexHull(vertices).simplices

        # Recursive subdivision of triangular faces
        for _ in range(level):
            new_faces = []
            midpoint_cache = {}

            def get_midpoint(i1, i2):
                nonlocal vertices
                key = tuple(sorted((i1, i2)))
                if key in midpoint_cache:
                    return midpoint_cache[key]
                v1, v2 = vertices[i1], vertices[i2]
                mid = (v1 + v2) / 2.0
                mid /= np.linalg.norm(mid)  # Project back to sphere
                vertices = np.vstack([vertices, mid])
                idx = len(vertices) - 1
                midpoint_cache[key] = idx
                return idx

            for tri in faces:
                a = get_midpoint(tri[0], tri[1])
                b = get_midpoint(tri[1], tri[2])
                c = get_midpoint(tri[2], tri[0])

                new_faces.append([tri[0], a, c])
                new_faces.append([tri[1], b, a])
                new_faces.append([tri[2], c, b])
                new_faces.append([a, b, c])

            faces = np.array(new_faces)

        # Calculate Latitude & Longitude from 3D Cartesian (x, y, z)
        x, y, z = vertices[:, 0], vertices[:, 1], vertices[:, 2]
        lat = np.degrees(np.arcsin(z))
        lon = np.degrees(np.arctan2(y, x))
        nodes_latlon = np.column_stack([lat, lon])

        return vertices, nodes_latlon

    def _construct_spherical_edges(self, k_neighbors: int = 6):
        """
        Computes Great-Circle geodesic distance matrix and connects nearest spherical neighbors.
        """
        # Great circle inner product
        dot_product = np.clip(np.dot(self.nodes_cartesian, self.nodes_cartesian.T), -1.0, 1.0)
        distances_rad = np.arccos(dot_product) # Geodesic distance on unit sphere
        
        src_list, dst_list = [], []
        attr_list = []

        for i in range(self.num_nodes):
            # Find k nearest geodesic neighbors (excluding self)
            neighbor_indices = np.argsort(distances_rad[i])[1:k_neighbors + 1]
            for j in neighbor_indices:
                src_list.append(i)
                dst_list.append(j)
                
                dx = self.nodes_cartesian[j, 0] - self.nodes_cartesian[i, 0]
                dy = self.nodes_cartesian[j, 1] - self.nodes_cartesian[i, 1]
                dz = self.nodes_cartesian[j, 2] - self.nodes_cartesian[i, 2]
                d_geo = distances_rad[i, j]
                attr_list.append([dx, dy, dz, d_geo])

        edge_index = torch.tensor([src_list, dst_list], dtype=torch.long)
        edge_attr = torch.tensor(attr_list, dtype=torch.float32)

        return edge_index, edge_attr

    def to_pyg_dict(self):
        """
        Returns graph representation compatible with PyTorch Geometric / DGL.
        """
        return {
            "num_nodes": self.num_nodes,
            "num_edges": self.edge_index.shape[1],
            "edge_index": self.edge_index,
            "edge_attr": self.edge_attr,
            "pos": torch.tensor(self.nodes_cartesian, dtype=torch.float32),
            "latlon": torch.tensor(self.nodes_latlon, dtype=torch.float32)
        }

def build_spherical_icosahedral_mesh(level: int = 3, subdivisions: int = None):
    sub_level = subdivisions if subdivisions is not None else level
    mesh_obj = SphericalIcosahedralMesh(subdivision_level=sub_level)
    d = mesh_obj.to_pyg_dict()
    d["edges_index"] = d["edge_index"]
    return d

if __name__ == "__main__":
    mesh = build_spherical_icosahedral_mesh(level=3)
    print(f"Spherical Icosahedral Mesh Created Successfully!")
    print(f"Num Nodes: {mesh['num_nodes']}, Num Edges: {mesh['num_edges']}")
    print(f"Edge Index Shape: {mesh['edge_index'].shape}")
